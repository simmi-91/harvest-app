import React from "react";

const LocationList = ({
  locations,
  activeLocations,
  selectedLocation,
  onLocationSelect,
}) => {
  return (
    <div className="">
      {locations.map((location) => {
        const isActive =
          location === "Alle" || activeLocations.includes(location);
        const isSelected = location === selectedLocation;

        return (
          <button
            key={location}
            onClick={() =>
              onLocationSelect(
                location === selectedLocation ? "Alle" : location
              )
            }
            disabled={!isActive}
            className={`
              location_btn 
              ${isActive ? (isSelected ? "active" : "non-active") : "empty"}
            `}
          >
            {location}
          </button>
        );
      })}
    </div>
  );
};

const LocationListSkeleton = ({ locations }) => {
  return (
    <div className="">
      {locations.map((location) => (
        <div key={location}></div>
      ))}
    </div>
  );
};

export default LocationList;
export { LocationListSkeleton }; // Eksporter skjelettversjonen også
