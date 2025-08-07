import React, { Fragment } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { TextField, Button, Tooltip } from "@mui/material";
import { HarvestEntry, PlantEntry, NewHarvestEntry } from "../../types";
import { Padding } from "@mui/icons-material";
import YardOutlinedIcon from "@mui/icons-material/YardOutlined";

export const HarvestTableWrap = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <TableContainer
    component={Paper}
    sx={{ backgroundColor: "rgba(240, 238, 226, 0.5)" }}
    {...props}
  >
    <Table sx={{ minWidth: 200, paddingBottom: "50px" }}>{children}</Table>
  </TableContainer>
);

export const HarvestTableHead = ({
  children,
}: {
  children: React.ReactNode;
}) => <TableHead>{children}</TableHead>;

export const HarvestTableBody = ({
  children,
}: {
  children: React.ReactNode;
}) => <TableBody>{children}</TableBody>;

export const HarvestTableRow = ({
  children,
  id,
  ...props
}: {
  children: React.ReactNode;
  id: string;
  [key: string]: any;
}) => (
  <TableRow id={id} {...props}>
    {children}
  </TableRow>
);

export const HarvestTableCell = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <TableCell size={"small"} align="center" {...props}>
    {children}
  </TableCell>
);

const mainrowStyle = {
  borderTop: "3px solid #c3d0a8",
  fontWeight: "bold",
  padding: "0 5px",
};

const subrowStyle = {
  borderTop: "2px dotted #c3d0a8",
};

export const HarvestTableGroup = ({
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
  <HarvestTableWrap>
    <HarvestTableHead>
      <HarvestTableRow
        id="harvestHeaderRow"
        sx={{ backgroundColor: "#c3d0a8" }}
      >
        <HarvestTableCell
          sx={mainrowStyle}
          children={undefined}
        ></HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle} align="left">
          Plante
        </HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle}>Mengde</HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle}>Uke</HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle}>Høstet</HarvestTableCell>
      </HarvestTableRow>
    </HarvestTableHead>

    <HarvestTableBody>
      {harvestData.map((harvestItem, idx) => (
        <Fragment key={harvestItem.id + "-fragment"}>
          <HarvestTableRow
            id={harvestItem.id + "-main"}
            key={harvestItem.id + "-main"}
          >
            <HarvestTableCell sx={{ ...mainrowStyle, width: 10 }}>
              {plantData.find(
                (plantItem) => plantItem.plant_id === harvestItem.plant_id
              )?.harvest_info ? (
                <Tooltip title="Se plante info">
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
            </HarvestTableCell>
            <HarvestTableCell align="left" sx={mainrowStyle}>
              {harvestItem.name}
            </HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle}>
              {harvestItem.amount}
            </HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle}>
              {harvestItem.week}
            </HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle}>
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
            </HarvestTableCell>
          </HarvestTableRow>

          {harvestItem.location_json && harvestItem.location_json.length > 0 ? (
            harvestItem.location_json.map((item, i) => {
              return (
                <HarvestTableRow key={idx + "_" + i} id={idx + "_" + i}>
                  <HarvestTableCell
                    sx={subrowStyle}
                    children={undefined}
                  ></HarvestTableCell>
                  <HarvestTableCell colSpan={4} sx={subrowStyle} align={"left"}>
                    <span style={{ display: "flex", flexDirection: "row" }}>
                      <span style={{ width: "100px" }}>{item.adress}</span>
                      <span style={{ width: "100px" }}>{item.position}</span>
                      <span style={{ width: "150px" }}>{item.plot || ""}</span>
                    </span>
                  </HarvestTableCell>
                </HarvestTableRow>
              );
            })
          ) : (
            <HarvestTableRow key={idx + "_tom"} id={idx + "_tom"}>
              <HarvestTableCell colSpan={5} sx={subrowStyle} align={"right"}>
                ingen JSON data eller feil ved render
              </HarvestTableCell>
            </HarvestTableRow>
          )}

          {/*
            !harvestItem.locationArray ||
          harvestItem.locationArray.length === 0 ? (
            <HarvestTableRow
              key={harvestItem.id + "-sub"}
              id={harvestItem.id + "-sub"}
            >
              <HarvestTableCell sx={subrowStyle} align={"right"}>
                {harvestItem.adress || ""}
              </HarvestTableCell>
              <HarvestTableCell sx={subrowStyle}>
                {harvestItem.position || ""}
              </HarvestTableCell>
              <HarvestTableCell sx={subrowStyle}>
                {harvestItem.plot || ""}
              </HarvestTableCell>
              <HarvestTableCell sx={subrowStyle}>
                <em>gammelt oppset</em>
              </HarvestTableCell>
            </HarvestTableRow>
          ) : (
            <>
              {harvestItem.locationArray.map((loc: string, idx: number) => {
                const content = loc.slice(1, -1); // remove [ and ]
                const [adress, position, plot] = content.split("|");

                let uniqeKey = harvestItem.id + "-" + adress + "-" + position;
                uniqeKey = uniqeKey.replace(/\s+/g, "");

                return (
                  <HarvestTableRow key={uniqeKey} id={uniqeKey}>
                    <HarvestTableCell sx={subrowStyle} align={"right"}>
                      {adress}
                    </HarvestTableCell>
                    <HarvestTableCell sx={subrowStyle}>
                      {position}
                    </HarvestTableCell>
                    <HarvestTableCell sx={subrowStyle}>
                      {plot || ""}
                    </HarvestTableCell>
                    <HarvestTableCell
                      sx={subrowStyle}
                      children={undefined}
                    ></HarvestTableCell>
                  </HarvestTableRow>
                );
              })}
            </>
          )
            */}
        </Fragment>
      ))}
    </HarvestTableBody>
  </HarvestTableWrap>
);

export const HarvestTableGroupNewEntry = ({
  harvestData,
}: {
  harvestData: NewHarvestEntry[];
}) => (
  <HarvestTableWrap>
    <HarvestTableHead>
      <HarvestTableRow
        id="harvestHeaderRow"
        sx={{ backgroundColor: "#c3d0a8" }}
      >
        <HarvestTableCell sx={mainrowStyle} align="left">
          N.
        </HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle} align="left">
          Plante
        </HarvestTableCell>
        <HarvestTableCell colSpan={2} sx={mainrowStyle}>
          Mengde
        </HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle}>Uke</HarvestTableCell>
      </HarvestTableRow>
    </HarvestTableHead>

    <HarvestTableBody>
      {harvestData.map((harvestItem, idx) => (
        <Fragment key={idx + "-fragment"}>
          <HarvestTableRow id={idx + "-main"} key={idx + "-main"}>
            <HarvestTableCell sx={mainrowStyle} align="left">
              {idx + 1}
            </HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle} align="left" size={"medium"}>
              {harvestItem.plant_name}
            </HarvestTableCell>
            <HarvestTableCell colSpan={2} sx={mainrowStyle}>
              {harvestItem.amount}
            </HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle}>
              {harvestItem.week}
            </HarvestTableCell>
          </HarvestTableRow>

          <HarvestTableRow key={idx + "_sub"} id={idx + "_sub"}>
            <HarvestTableCell
              sx={{ ...subrowStyle, padding: "0px", color: "gray" }}
              align={"right"}
            >
              Adresse
            </HarvestTableCell>
            <HarvestTableCell
              sx={{ ...subrowStyle, padding: "0px", color: "gray" }}
            >
              Posisjon
            </HarvestTableCell>
            <HarvestTableCell
              sx={{ ...subrowStyle, padding: "0px", color: "gray" }}
            >
              Kasse
            </HarvestTableCell>
            <HarvestTableCell
              sx={subrowStyle}
              children={undefined}
            ></HarvestTableCell>
          </HarvestTableRow>
          {harvestItem.location_json.map((item, i) => {
            return (
              <HarvestTableRow key={idx + "_" + i} id={idx + "_" + i}>
                <HarvestTableCell sx={subrowStyle} align={"right"}>
                  {item.adress}
                </HarvestTableCell>
                <HarvestTableCell sx={subrowStyle}>
                  {item.position}
                </HarvestTableCell>
                <HarvestTableCell sx={subrowStyle}>
                  {item.plot || ""}
                </HarvestTableCell>
                <HarvestTableCell
                  sx={subrowStyle}
                  children={undefined}
                ></HarvestTableCell>
              </HarvestTableRow>
            );
          })}
        </Fragment>
      ))}
    </HarvestTableBody>
  </HarvestTableWrap>
);

export const TableHeader = (
  columns: {
    key: string;
    text: string | React.JSX.Element;
    align: string;
  }[]
) => (
  <HarvestTableWrap>
    <HarvestTableHead>
      <HarvestTableRow
        id="customTableHeaderRow"
        sx={{ backgroundColor: "#c3d0a8" }}
      >
        {columns.map((item) => (
          <HarvestTableCell key={item.key} sx={mainrowStyle} align={item.align}>
            {item.text}
          </HarvestTableCell>
        ))}
      </HarvestTableRow>
    </HarvestTableHead>
  </HarvestTableWrap>
);
