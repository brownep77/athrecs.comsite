import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";

export type AthleteProfileResultVisibility = {
  hiddenResultIds: number[];
};

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

function resultIdentifier(value: unknown, label: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed === 0 || Math.abs(parsed) > 2147483647)
    throw new Error(`${label} is invalid`);
  return parsed;
}

async function resultBelongsToAccount(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  resultId: number,
): Promise<boolean> {
  const rows = await sql<{ allowed: boolean }>`
    select exists (
      select 1
      from athlete_claimable_results result
      join athlete_account_links account_link
        on account_link.athlete_id = result.athlete_id
      where result.id = ${resultId}
        and account_link.user_id = ${userId}
        and account_link.status = 'active'
    ) as allowed
  `;
  return Boolean(rows[0]?.allowed);
}

export const getMyProfileResultVisibility = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready();
    const rows = await sql<{ result_id: number }>`
      select hidden.result_id
      from (select user_id,result_id,hidden_at from athlete_profile_hidden_results
        union all select user_id,-source_result_id,hidden_at from athlete_profile_hidden_source_results) hidden
      join athlete_claimable_results result on result.id = hidden.result_id
      join athlete_account_links account_link
        on account_link.athlete_id = result.athlete_id
      where hidden.user_id = ${context.userId}
        and account_link.user_id = ${context.userId}
        and account_link.status = 'active'
      order by hidden.hidden_at desc, hidden.result_id desc
    `;
    return {
      hiddenResultIds: rows.map((row) => row.result_id),
    } satisfies AthleteProfileResultVisibility;
  });

export const hideResultFromMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { resultId: number }) => ({
    resultId: resultIdentifier(input?.resultId, "Result"),
  }))
  .handler(async ({ data, context }) => {
    const sql = await ready();
    if (!(await resultBelongsToAccount(sql, context.userId, data.resultId))) {
      throw new Error("This result is not linked to your Athlete Account");
    }
    if (data.resultId < 0) {
      await sql`insert into athlete_profile_hidden_source_results(user_id,source_result_id,hidden_at)
        values(${context.userId},${-data.resultId},now())
        on conflict(user_id,source_result_id) do update set hidden_at=now()`;
      return { hidden: true, resultId: data.resultId };
    }
    await sql`
      insert into athlete_profile_hidden_results (user_id, result_id, hidden_at)
      values (${context.userId}, ${data.resultId}, now())
      on conflict (user_id, result_id) do update set hidden_at = now()
    `;
    return { hidden: true, resultId: data.resultId };
  });

export const restoreResultToMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { resultId: number }) => ({
    resultId: resultIdentifier(input?.resultId, "Result"),
  }))
  .handler(async ({ data, context }) => {
    const sql = await ready();
    if (data.resultId < 0) {
      const rows = await sql`delete from athlete_profile_hidden_source_results
        where user_id=${context.userId} and source_result_id=${-data.resultId} returning source_result_id`;
      return { restored: Boolean(rows[0]), resultId: data.resultId };
    }
    const rows = await sql<{ result_id: number }>`
      delete from athlete_profile_hidden_results
      where user_id = ${context.userId}
        and result_id = ${data.resultId}
      returning result_id
    `;
    return { restored: Boolean(rows[0]), resultId: data.resultId };
  });
