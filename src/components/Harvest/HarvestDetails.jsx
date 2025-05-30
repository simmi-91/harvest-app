import React from "react";

const HarvestDetails = ({ harvestData, selectedPlant }) => {
  if (!selectedPlant) {
    return (
      <p className="text-gray">
        Velg en plante for å se høsteinstruksjoner og tips.
      </p>
    );
  }

  const plantInfo = harvestData.find((item) => item.plant === selectedPlant);

  if (!plantInfo) {
    return (
      <p className="text-red">Fant ikke informasjon for {selectedPlant}.</p>
    );
  }

  return (
    <div className="margin-bottom">
      <h3 className="green-header">{selectedPlant}</h3>
      <div className="bg-white">
        <p className="">
          <strong>Slik høster du:</strong> {plantInfo.harvest_info}
        </p>
        <p className="padding-top">
          <strong>Tips:</strong> {plantInfo.use_tips}
        </p>
      </div>
    </div>
  );
};

const HarvestDetailsSkeleton = () => {
  return (
    <div className="bg-white">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default HarvestDetails;
export { HarvestDetailsSkeleton }; // Eksporter skjelettversjonen også
