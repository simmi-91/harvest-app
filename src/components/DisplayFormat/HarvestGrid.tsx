import React, { Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
} from "@mui/material";

import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

import { TextField, Button, Tooltip } from "@mui/material";
import { HarvestEntry, PlantEntry, NewHarvestEntry } from "../../types";
import { Padding } from "@mui/icons-material";
import YardOutlinedIcon from "@mui/icons-material/YardOutlined";

const mainrowStyle = {
  borderTop: "3px solid #c3d0a8",
  fontWeight: "bold",
  padding: "10px 5px 2px 5px",
  alignContent: "center",
};

const subrowStyle = {
  borderTop: "2px dotted #c3d0a8",
  alignContent: "center",
};

const b = {
  fontWeight: "bold",
};

const aSize = {
  xs: 4,
  md: 3,
};
const sSize = {
  xs: 3,
  md: 2,
};
const pSize = {
  xs: 4,
  md: 3,
};

export const HarvestGrid = ({
  harvestData,
  plantData,
  showPlantInfoId,
  handleHarvestToggle,
  setShowPlantInfoId,
  triggerSearch,
}: {
  harvestData: HarvestEntry[];
  plantData: PlantEntry[];
  showPlantInfoId: number;
  handleHarvestToggle: (id: number) => Promise<void>;
  setShowPlantInfoId: (id: number) => void;
  triggerSearch: () => void;
}) => (
  <Box component={Paper} sx={{ width: "100%", background: "transparent" }}>
    <Grid container spacing={0} padding={1} className="greenBg">
      {/* Header */}
      <Grid size={1} sx={b}></Grid>
      <Grid size={3} sx={{ ...b, textAlign: "left" }}>
        Plante
      </Grid>
      <Grid size={6} sx={b}>
        Mengde
      </Grid>
      <Grid size={2} sx={b}>
        Uke
      </Grid>

      {/* Sub Header */}
      <Grid size={1}></Grid>
      <Grid size={8} sx={{ fontSize: "13px" }}>
        <Stack direction={"row"} sx={{ textAlign: "left" }}>
          <Grid size={aSize}>Adresse</Grid>
          <Grid size={sSize}>Sted</Grid>
          <Grid size={pSize}>Kasse</Grid>
        </Stack>
      </Grid>
      <Grid size={3} sx={{ alignContent: "center" }}>
        Høstet
      </Grid>
    </Grid>

    {harvestData.map((harvestItem) => (
      <Grid container spacing={0} key={harvestItem.id} className="whiteBg">
        {/* Harvest row */}
        <Grid size={1} sx={{ ...mainrowStyle }}>
          {plantData.find(
            (plantItem) => plantItem.plant_id === harvestItem.plant_id
          )?.harvest_info ? (
            <Tooltip title="Se plante info" sx={{ textAlign: "center" }}>
              <YardOutlinedIcon
                aria-label="Se plante info"
                sx={{ cursor: "pointer" }}
                onClick={() =>
                  setShowPlantInfoId(
                    showPlantInfoId === harvestItem.plant_id
                      ? 0
                      : harvestItem.plant_id
                  )
                }
              />
            </Tooltip>
          ) : null}
        </Grid>
        <Grid size={3} sx={{ ...mainrowStyle, textAlign: "left" }}>
          {harvestItem.name}
        </Grid>
        <Grid size={6} sx={{ ...mainrowStyle }}>
          {harvestItem.amount}
        </Grid>
        <Grid size={2} sx={{ ...mainrowStyle }}>
          {harvestItem.week}
        </Grid>

        {/* Location row */}
        <Grid size={1} sx={{ ...subrowStyle }}></Grid>

        <Grid size={8} sx={{ ...subrowStyle, paddingBottom: "20px" }}>
          {harvestItem.location_json.map((lokasjon, index) => (
            <Stack
              direction={"row"}
              key={harvestItem.id + "_sub_" + index}
              sx={{
                fontSize: "13px",
                textAlign: "left",
              }}
            >
              <Grid size={aSize}>{lokasjon.adress}</Grid>
              <Grid size={sSize}>{lokasjon.position}</Grid>
              <Grid size={pSize}>{lokasjon.plot}</Grid>
            </Stack>
          ))}
        </Grid>

        <Grid size={3} sx={{ ...subrowStyle, alignContent: "center" }}>
          <Button
            size="small"
            onClick={() => {
              handleHarvestToggle(harvestItem.id);
              triggerSearch();
            }}
            variant={+harvestItem.done === 1 ? "outlined" : "contained"}
          >
            {+harvestItem.done === 1 ? "Ja" : "Nei"}
          </Button>
        </Grid>
      </Grid>
    ))}
  </Box>
);
