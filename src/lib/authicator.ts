import z from "zod/v3";
export const onboardingSchema = z.object({
    industry: z.string({
    required_error: "Please select an industry",
  }).min(2,"Industry is required"),
  subIndustry: z.string({
    required_error: "Please select a specialization",
  }).min(1,"subIndustry is required"),
  bio: z.string().max(500).optional(),
    experience: z.coerce
    .number()
    .min(0, "Experience must be at least 0 years")
    .max(50, "Experience cannot exceed 50 years"),
 skills: z.array(
  z.string()
    .min(1, "Skill name cannot be empty")
    .max(50, "Skill name too long")
)
.min(1, "Please add at least one skill")
.max(20, "Maximum 20 skills allowed")
.refine(
  (skills) => new Set(skills).size === skills.length,
  "Duplicate skills are not allowed"
),
});

// export types for convenience
export type OnboardingSchemaInput = z.input<typeof onboardingSchema>;   // what the form provides
export type OnboardingSchemaOutput = z.output<typeof onboardingSchema>; 
