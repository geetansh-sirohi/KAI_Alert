import { z } from "zod";

export const TriageResponseSchema = z.object({
  hazard_type: z.enum([
    "DOWNED_POWERLINE",
    "SUBMERGED_ROAD",
    "BLOCKED_EVACUATION_ROAD",
    "STRUCTURAL_ROOF_COLLAPSE",
    "DEBRIS_DAM",
    "STRANDED_CIVILIANS",
    "ISOLATED_CIVILIANS",
    "HOSPITAL_GENERATOR_FLOOD",
    "SUBMERGED_TRANSFORMER",
    "BREACHED_EMBANKMENT",
    "NONE_DETECTED",
  ]),
  severity: z.enum(["P1_CRITICAL", "P2_SEVERE", "P3_MODERATE", "P4_LOW"]),
  life_safety_risk: z.boolean(),
  detected_features: z.array(z.string()).min(1),
  recommended_machinery: z.array(
    z.enum([
      "ELECTRICAL_ISOLATION_UNIT",
      "HIGH_DISCHARGE_PUMP",
      "PUMPING_UNIT",
      "CHAINSAW_CREW",
      "AMPHIBIOUS_ARV",
      "INFLATABLE_RESCUE_BOAT",
      "EARTHMOVER_JCB",
      "JCB_EARTHMOVER",
      "MOBILE_DG_CONTAINER",
      "AMBULANCE_EXTRACTION",
    ])
  ),
  estimated_clearance_time_hours: z.number().positive(),
  confidence_score: z.number().min(0).max(1),
  triage_summary: z.string().max(300),
});

export type TriageResponse = z.infer<typeof TriageResponseSchema>;
