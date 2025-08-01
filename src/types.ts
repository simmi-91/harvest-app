export type Event = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export type HarvestEntry = {
  id: number;
  plant_id: number;
  name: string;
  week: number;
  year: number;
  plot_order: number;
  amount: string;
  done: number;
  location_json: LocationEntry[];
  full_location?: string;
  locationArray?: string[];
  adress?: string; //to be deleted
  position?: string; //to be deleted
  plot?: string; //to be deleted
};

export type NewHarvestEntry = {
  plant_name: string;
  plant_id: number;
  week: number;
  year: number;
  amount: string;
  plot_order: number;
  location_json: LocationEntry[];
};

export type LocationEntry = {
  adress: string;
  position: string;
  plot?: string;
};

export type PlantEntry = {
  plant_id: number;
  name: string;
  latin: string;
  harvest_info: string;
  use_tips: string;
  year: number;
  category: string | null;
  variant: string | null;
  image: string | null;
};

export type AdressEntry = {
  [key: string]: string[];
};
