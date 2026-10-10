// A displayed "None" category is explicitly unclassified. Preserve the source's
// rank verbatim without representing it as a rank in an age/sex category.
export function normalizePrivateSourceRow(row) {
  if (row.category !== "None" || row.original?.Category !== "None") return row;
  return {
    ...row,
    category: null,
    categoryPlace: null,
    sourceCategoryLabel: row.category,
    sourceCategoryPlace: row.categoryPlace,
    classificationNote: "Source explicitly displays Category=None; original Cat Pos is retained without assigning a category placing.",
  };
}
