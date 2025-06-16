import { plantApi, harvestApi } from "./Paths";

export const fetchPlants = async () => {
  try {
    const response = await fetch(plantApi());
    if (!response.ok) {
      throw new Error(`Failed to fetch plants: ${response.status}`);
    }
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    throw new Error(`Error fetching plants: ${err.message}`);
  }
};

export const fetchHarvestData = async (week = null, year = null) => {
  try {
    const url = week && year 
      ? `${harvestApi()}?week=${week}&year=${year}`
      : harvestApi();
      
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch harvest data: ${response.status}`);
    }
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    throw new Error(`Error fetching harvest data: ${err.message}`);
  }
};

export const updateHarvestEntry = async (id, updatedFields) => {
  try {
    const response = await fetch(`${harvestApi()}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFields),
    });

    if (!response.ok) {
      throw new Error('Failed to update harvest data');
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    return result;
  } catch (err) {
    throw new Error(`Error updating harvest entry: ${err.message}`);
  }
};

export const deleteHarvestEntry = async (id) => {
  try {
    const response = await fetch(`${harvestApi()}?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete harvest data');
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    return result;
  } catch (err) {
    throw new Error(`Error deleting harvest entry: ${err.message}`);
  }
};

export const enrichHarvestData = (harvestData, plantsData) => {
  return harvestData.map(item => {
    const plant = plantsData.find(p => p.plant_id === item.plant_id);
    return {
      ...item,
      plant_name: plant ? plant.name : 'Unknown Plant',
      plant_category: plant ? plant.category : null,
      plant_info: plant ? plant.harvest_info : null,
      plant_tips: plant ? plant.use_tips : null,
    };
  });
}; 