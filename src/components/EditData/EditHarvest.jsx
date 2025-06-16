import React, { useState, useEffect } from "react";
import WeekYear from "../WeekYear";
import { fetchPlants, fetchHarvestData, updateHarvestEntry, deleteHarvestEntry, enrichHarvestData } from "../../Utils/DataFetching";
import { Autocomplete, TextField } from "@mui/material";

const EditHarvest = () => {
  const [harvestData, setHarvestData] = useState([]);
  const [plantsData, setPlantsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [searchPlant, setSearchPlant] = useState(null);
  const [searchWeek, setSearchWeek] = useState("");
  const [searchYear, setSearchYear] = useState(new Date().getFullYear().toString());
  const [searchLocation, setSearchLocation] = useState(null);
  const [editableFields, setEditableFields] = useState({});
  
  const uniqueLocations = [...new Set(harvestData.map(item => item.position))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [plants, harvests] = await Promise.all([
          fetchPlants(),
          fetchHarvestData()
        ]);
        setPlantsData(plants);
        setHarvestData(harvests);
        const filteredHarvests = harvests.filter(item => item.year === new Date().getFullYear().toString());
        setFilteredData(filteredHarvests);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleSearch = () => {
    let filtered = [...harvestData];
    
    if (searchPlant) {
      filtered = filtered.filter(item => {
        const plant = plantsData.find(p => p.plant_id === item.plant_id);
        return plant && plant.name === searchPlant;
      });
    }
    
    if (searchWeek && searchYear) {
      filtered = filtered.filter(item => 
        item.week === parseInt(searchWeek) && item.year === parseInt(searchYear)
      );
    }
    
    if (searchLocation) {
      filtered = filtered.filter(item => 
        item.position === searchLocation
      );
    }
    
    setFilteredData(filtered);
  };

  const handleEdit = (id, field, value) => {
    setEditableFields(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (id) => {
    const updatedFields = editableFields[id];
    if (!updatedFields) return;

    try {
      const result = await updateHarvestEntry(id, updatedFields);
      
      setHarvestData(prevData => 
        prevData.map(item => 
          item.id === id ? { ...item, ...updatedFields } : item
        )
      );
      setFilteredData(prevData => 
        prevData.map(item => 
          item.id === id ? { ...item, ...updatedFields } : item
        )
      );
      
      setEditableFields(prev => {
        const newFields = { ...prev };
        delete newFields[id];
        return newFields;
      });

      setSuccessMessage(result.message);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this harvest entry?')) {
      return;
    }

    try {
      await deleteHarvestEntry(id);
      
      setHarvestData(prevData => prevData.filter(item => item.id !== id));
      setFilteredData(prevData => prevData.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const getPlantName = (plantId) => {
    const plant = plantsData.find(p => p.plant_id === plantId);
    return plant ? plant.name : 'Unknown Plant';
  };

  return (
    <div className="container">
      <div className="harvest-container round-top round-bot">
        <h2 className="harvest-title">Endre Høstedata</h2>
                
        <div className="flex-row flex-wrap harvest-controls">
          
          <Autocomplete
            value={searchPlant}
            onChange={(event, newValue) => {
              setSearchPlant(newValue);
            }}
            options={plantsData.map(plant => plant.name)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Plante"
                size="small"
              />
            )}
            style={{ width: 200 }}
          />

          <Autocomplete
            value={searchLocation}
            onChange={(event, newValue) => {
              setSearchLocation(newValue);
            }}
            options={uniqueLocations}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Plassering"
                size="small"
              />
            )}
            style={{ width: 200 }}
          />

          <WeekYear 
            week={searchWeek} 
            year={searchYear}
            onWeekChange={setSearchWeek}
            onYearChange={setSearchYear}
            blnIncrement={false}
          />

          <button
            onClick={handleSearch}
            className="round-top round-bot"
          >
            Søk
          </button>
        </div>
      </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red">{error}</div>
        ) : (
          <>
          <div className="table-container border">
            <div className="table-header bg-light border-light round-top mb-0">&nbsp;</div>
            <div style={{overflowX: 'scroll'}}>
            <table className="harvest-table bg-white">
              <thead>
                <tr>
                  <th>Plante</th>
                  <th>Uke/År</th>
                  <th>Høstet</th>
                  <th>Pallekarmnr</th>
                  <th>Plot</th>
                  <th>Mengde</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredData
                  .sort((a, b) => {
                    if (a.plant_id !== b.plant_id) return a.plant_id - b.plant_id;
                    return a.week - b.week;
                  })
                  .map((entry) => (
                  <tr key={entry.id}>
                    <td>{getPlantName(entry.plant_id)}</td>
                    <td>{entry.week}/{entry.year}</td>
                    <td>{entry.done}</td>
                    <td>
                      <input
                        type="text"
                        value={editableFields[entry.id]?.position || entry.position}
                        onChange={(e) => handleEdit(entry.id, 'position', e.target.value)}
                        className="border"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editableFields[entry.id]?.plot || entry.plot}
                        onChange={(e) => handleEdit(entry.id, 'plot', e.target.value)}
                        className="border input-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editableFields[entry.id]?.amount || entry.amount}
                        onChange={(e) => handleEdit(entry.id, 'amount', e.target.value)}
                        className="border"
                      />
                    </td>
                    <td>
                      <div className="flex-row gap-2">
                        <button
                          onClick={() => handleSubmit(entry.id)}
                          className="round-top round-bot"
                          disabled={!editableFields[entry.id]}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="round-top round-bot"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
          {successMessage && (
            <footer className="round-top round-bot"><em>{successMessage}</em></footer>
          )}
          </>
        )}
    </div>
  );
};

export default EditHarvest;
