import React, { useEffect } from "react";
import {
  Stack,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocalFloristRoundedIcon from "@mui/icons-material/LocalFloristRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import YardOutlinedIcon from "@mui/icons-material/YardOutlined";
import EmojiNatureTwoToneIcon from "@mui/icons-material/EmojiNatureTwoTone";

import { PlantEntry } from "../../types";

type PlantInfoProps = {
  id: number;
  plantData: PlantEntry[];
  setShowPlantInfoId: (id: number) => void;
};
const PlantInfo = ({ id, plantData, setShowPlantInfoId }: PlantInfoProps) => {
  const activePlant: PlantEntry | undefined = plantData.find(
    (plantItem) => id === plantItem.plant_id
  );

  return (
    <Stack direction="column" spacing={2} margin={1}>
      {activePlant ? (
        <Card
          sx={{
            minWidth: "200px",
            maxHeight: "300px",
            overflowY: "auto",
            backgroundColor: "rgba(240, 238, 226, 0.5)",
          }}
        >
          <CardHeader
            avatar={<EmojiNatureTwoToneIcon />}
            title={activePlant.name}
            subheader={activePlant.latin}
            action={
              <IconButton
                aria-label="Lukk"
                onClick={() => setShowPlantInfoId(0)}
              >
                <CloseRoundedIcon />
              </IconButton>
            }
            sx={{ borderBottom: "thin solid gray" }}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "center", md: "flex-start" },
            }}
          >
            <CardContent sx={{ flex: 1 }}>
              {activePlant.harvest_info ? (
                <>
                  <Typography variant="subtitle1">Høste info</Typography>
                  <Typography variant="body2">
                    {activePlant.harvest_info}
                  </Typography>
                </>
              ) : null}

              {activePlant.use_tips ? (
                <>
                  <Typography variant="subtitle1">Tips</Typography>
                  <Typography variant="body2">
                    {activePlant.use_tips}
                  </Typography>
                </>
              ) : null}
            </CardContent>
            {activePlant.image ? (
              <CardMedia
                component="img"
                sx={{
                  height: { xs: "100%", md: "100%" },
                  width: { xs: "100%", md: "200px" },
                  maxHeight: "400px",
                  maxWidth: "400px",
                  flexShrink: 0,
                }}
                image="/static/images/leaf.png"
                alt={activePlant.name}
              />
            ) : null}
          </Box>
        </Card>
      ) : (
        "Fant ingen plante med id " + { id }
      )}
    </Stack>
  );
};
export default PlantInfo;
