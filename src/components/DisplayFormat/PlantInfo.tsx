import React, { useEffect } from "react";
import {
  Stack,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Typography,
} from "@mui/material";
import { PlantEntry } from "../../types";

type PlantInfoProps = {
  id: number;
  plantData: PlantEntry[];
  setShowPlantInfoId: (id: number) => void;
};
const PlantInfo = ({ id, plantData }: PlantInfoProps) => {
  const activePlant: PlantEntry | undefined = plantData.find(
    (plantItem) => id === plantItem.plant_id
  );

  useEffect(() => {
    //console.log("id", id, activePlant);
  }, []);

  return (
    <Stack
      direction="column"
      spacing={2}
      margin={1}
      useFlexGap
      sx={{
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {activePlant ? (
        <Card sx={{ minWidth: "200px", maxHeight: "300px", overflowY: "auto" }}>
          <CardHeader title={activePlant.name} subheader={activePlant.latin} />
          {/*<CardMedia
            component="img"
            height="50"
            image="/static/images/cards/paella.jpg"
            alt={activePlant.name}
          />*/}
          <CardContent>
            {activePlant.harvest_info ? (
              <>
                <Typography variant="h6">Høste info</Typography>
                <Typography variant="body2">
                  {activePlant.harvest_info}
                </Typography>
              </>
            ) : null}

            {activePlant.use_tips ? (
              <>
                <Typography variant="h6">Tips</Typography>
                <Typography variant="body2">{activePlant.use_tips}</Typography>
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        "Fant ingen plante med id " + { id }
      )}
    </Stack>
  );
};
export default PlantInfo;

{
  /*<div>
          <h3>{activePlant.name}</h3>
          <small>{activePlant.latin}</small>
          <p>{activePlant.harvest_info}</p>
          <p>{activePlant.use_tips}</p>
        </div>*/
}
