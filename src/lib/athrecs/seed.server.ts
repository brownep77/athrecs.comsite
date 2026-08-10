import { getSql } from "@/lib/db";
import {
  athletes as athleteSeeds,
  catalogueMetadata,
  clubs as clubSeeds,
  editions as editionSeeds,
  results as resultSeeds,
  seriesList,
} from "@/data/catalogue";

const SEED_VERSION = "athrecs-rn2025-batch1-v30";
const EXPECTED = catalogueMetadata.merged_counts;
