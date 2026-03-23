export type humor_flavors = {
  id: number;
  created_datetime_utc: string;
  description: string | null;
  slug: string;
  created_by_user_id: string | null;
  modified_by_user_id: string | null;
  modified_datetime_utc: string | null;
};

export type humor_flavor_steps = {
  id: number;
  created_datetime_utc: string;
  humor_flavor_id: number;
  llm_temperature: number | null;
  order_by: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_model_id: number;
  humor_flavor_step_type_id: number;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  description: string | null;
  created_by_user_id: string | null;
  modified_by_user_id: string | null;
  modified_datetime_utc: string | null;
};

export type llm_input_types = {
  id: number;
  description: string | null;
  slug: string;
};

export type llm_output_types = {
  id: number;
  description: string | null;
  slug: string;
};

export type llm_models = {
  id: number;
  name: string;
  provider_model_id: string;
  is_temperature_supported: boolean;
};

export type humor_flavor_step_types = {
  id: number;
  slug: string;
  description: string | null;
};

export type HumorFlavor = humor_flavors;
export type HumorFlavorStep = humor_flavor_steps;
export type LlmInputType = llm_input_types;
export type LlmOutputType = llm_output_types;
export type LlmModel = llm_models;
export type HumorFlavorStepType = humor_flavor_step_types;
