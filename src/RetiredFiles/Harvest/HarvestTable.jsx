import React from "react";

const HarvestTable = ({
  harvestData,
  onHarvestToggle,
  selectedPlant,
  onPlantSelect,
}) => {
  //console.log("HarvestTable received data:", harvestData);

  const groupedData = harvestData.reduce((acc, item) => {
    if (!acc[item.position]) {
      acc[item.position] = [];
    }
    acc[item.position].push(item);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedData).map(([position, data]) => (
        <div
          key={position}
          className={`table-container border ${
            position.includes("Ulven T") ? "ulven-t" : ""
          }`}
        >
          <h3 className="table-header bg-light border-light round-top mb-0">{position}</h3>
          <div className="">
            <table className="bg-white">
              <thead className="">
                <tr>
                  <th className="">Plante</th>
                  <th className="pallekarm">Pallekarmnr.</th>
                  <th className="">Mengde</th>
                  <th className="">Høstet</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="">
                    <td
                      className="cursor-pointer"
                      onClick={() =>
                        onPlantSelect(
                          selectedPlant === item.plant ? null : item.plant
                        )
                      }
                    >
                      {item.plant}
                    </td>
                    <td className="pallekarm">{item.plot}</td>
                    <td className="">{item.amount}</td>
                    <td className="">
                      <button
                        onClick={() => onHarvestToggle(item.id)}
                        className={`
                                                    ${
                                                      item.isHarvested
                                                        ? "active"
                                                        : ""
                                                    }
                                                `}
                      >
                        {item.isHarvested ? "Ja" : "Nei"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
};

const HarvestTableSkeleton = () => {
  const numRows = 5;
  return (
    <div className="table-container">
      <h3 className=""></h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <tbody>
            {Array.from({ length: numRows }).map((_, i) => (
              <tr key={i} className=" animate-pulse">
                <td className=""></td>
                <td className=""></td>
                <td className=""></td>
                <td className=""></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HarvestTable;
export { HarvestTableSkeleton }; // Eksporter skjelettversjonen også
