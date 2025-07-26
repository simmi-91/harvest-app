import { React, Fragment } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { TextField, Button } from '@mui/material';

export const HarvestTableWrap = ({ children, ...props }) => (
  <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(240, 238, 226, 0.5)' }} {...props} >
    <Table sx={{ minWidth: 200, paddingBottom: '50px' }}>
      {children}
    </Table>
  </TableContainer>
);

export const HarvestTableHead = ({ children }) => (
  <TableHead>
    {children}
  </TableHead>
);

export const HarvestTableBody = ({ children }) => (
  <TableBody>
    {children}
  </TableBody>
);

export const HarvestTableRow = ({ children, id, ...props }) => (
  <TableRow id={id} {...props}>
    {children}
  </TableRow>
);

export const HarvestTableCell = ({ children, ...props }) => (
  <TableCell size={'small'} align="center" {...props}>
    {children}
  </TableCell>
);

const mainrowStyle = {
  borderTop: '3px solid #c3d0a8',
  fontWeight: 'bold',
  padding: '0 5px'
};
const subrowStyle = {
  borderTop: '2px dotted #c3d0a8'
};

export const HarvestTableGroup = ({ harvestData, handleHarvestToggle }) => (
  <HarvestTableWrap>
    <HarvestTableHead>

      <HarvestTableRow sx={{ backgroundColor: '#c3d0a8' }}>

        <HarvestTableCell sx={mainrowStyle} align="left">Plante</HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle}>Mengde</HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle}>Uke</HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle}>Høstet</HarvestTableCell>

      </HarvestTableRow>

    </HarvestTableHead>

    <HarvestTableBody>

      {harvestData.map(harvestItem => (

        <Fragment key={harvestItem.id + '-fragment'}>

          <HarvestTableRow key={harvestItem.id + '-main'}>

            <HarvestTableCell sx={mainrowStyle} align="left" size={"medium"}>{harvestItem.name}</HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle}>{harvestItem.amount}</HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle}>{harvestItem.week}</HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle}>
              <Button
                size="small"
                onClick={() => handleHarvestToggle(harvestItem.id)}
                variant={+harvestItem.done === 1 ? 'outlined' : 'contained'}>
                {+harvestItem.done === 1 ? 'Ja' : 'Nei'}
              </Button>
            </HarvestTableCell>

          </HarvestTableRow>


          {
            (!harvestItem.locationArray || harvestItem.locationArray.length === 0) ? (
              <HarvestTableRow key={harvestItem.id + '-sub'} id={harvestItem.id + '-sub'}>
                <HarvestTableCell sx={subrowStyle} align={'right'}>{harvestItem.adress || ''}</HarvestTableCell>
                <HarvestTableCell sx={subrowStyle}>{harvestItem.position || ''}</HarvestTableCell>
                <HarvestTableCell sx={subrowStyle}>{harvestItem.plot || ''}</HarvestTableCell>
                <HarvestTableCell sx={subrowStyle}><em>gammelt oppset</em></HarvestTableCell>
              </HarvestTableRow>
            ) : (
              <>
                {
                  harvestItem.locationArray.map((loc, idx) => {
                    const content = loc.slice(1, -1); // remove [ and ]
                    const [adress, position, plot] = content.split('|');

                    let uniqeKey = harvestItem.id + '-' + adress + '-' + position;
                    uniqeKey = uniqeKey.replace(/\s+/g, '');

                    return (
                      <HarvestTableRow key={uniqeKey} id={uniqeKey}>
                        <HarvestTableCell sx={subrowStyle} align={'right'}>{adress}</HarvestTableCell>
                        <HarvestTableCell sx={subrowStyle}>{position}</HarvestTableCell>
                        <HarvestTableCell sx={subrowStyle}>{plot || ''}</HarvestTableCell>
                        <HarvestTableCell sx={subrowStyle}></HarvestTableCell>
                      </HarvestTableRow>
                    )
                  })
                }
              </>
            )
          }


        </Fragment>
      ))}

    </HarvestTableBody>

  </HarvestTableWrap>
);

export const HarvestEditTableGroup = ({ harvestData, handlePreview, handleSaveHarvestData }) => (
  <HarvestTableWrap>
    <HarvestTableHead>

      <HarvestTableRow sx={{ backgroundColor: '#c3d0a8' }}>

        <HarvestTableCell sx={mainrowStyle} align={'left'}>Plante</HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle}>Mengde</HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle}>Uke</HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle}>Høstet</HarvestTableCell>
        <HarvestTableCell sx={mainrowStyle}></HarvestTableCell>

      </HarvestTableRow>

    </HarvestTableHead>

    <HarvestTableBody>

      {harvestData.map(harvestItem => (

        <Fragment key={harvestItem.id + '-fragment'}>

          <HarvestTableRow key={harvestItem.id + '-main'} id={harvestItem.id + '-main'}>

            <HarvestTableCell sx={mainrowStyle} align={'left'} size={"medium"}>({harvestItem.id}) {harvestItem.name}</HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle}>
              <TextField
                label="amount"
                name="amount"
                variant="standard"
                size="small"
                defaultValue={harvestItem.amount || ''}
              />
            </HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle}>{harvestItem.week}</HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle}>{harvestItem.done}</HarvestTableCell>
            <HarvestTableCell sx={mainrowStyle}></HarvestTableCell>

          </HarvestTableRow>

          {
            (!harvestItem.locationArray || harvestItem.locationArray.length === 0) ? (
              {/*
              <Fragment key={harvestItem.id + '-sub-fragment'}>

                <HarvestTableRow key={harvestItem.id + '-sub-olddata'} id={harvestItem.id + '-sub-olddata'}>

                  <HarvestTableCell colSpan={5} sx={subrowStyle} align={"left"}>
                    <em>gammelt oppset</em>: [ {harvestItem.adress || ''} |  {harvestItem.position || ''} |  {harvestItem.plot || ''} ]
                  </HarvestTableCell>

                </HarvestTableRow>

                <HarvestTableRow key={harvestItem.id + '-sub'} id={harvestItem.id + '-sub'}>
                  <HarvestTableCell sx={subrowStyle}>
                    <TextField
                      label="adress"
                      name="adress"
                      variant="standard"
                      size="small"
                      defaultValue={harvestItem.adress || ''}
                      onChange={(e) => handlePreview(harvestItem.id, 'adress', e.target.value, 0)}
                    />
                  </HarvestTableCell>
                  <HarvestTableCell sx={subrowStyle}>
                    <TextField
                      label="position"
                      name="position"
                      variant="standard"
                      size="small"
                      defaultValue={harvestItem.position || ''}
                      onChange={(e) => handlePreview(harvestItem.id, 'position', e.target.value, 0)}
                    />
                  </HarvestTableCell>
                  <HarvestTableCell sx={subrowStyle}>
                    <TextField
                      label="plot"
                      name="plot"
                      variant="standard"
                      size="small"
                      defaultValue={harvestItem.plot != 0 ? harvestItem.plot : ''}
                      onChange={(e) => handlePreview(harvestItem.id, 'plot', e.target.value, 0)}
                    />
                  </HarvestTableCell>
                  <HarvestTableCell colSpan={2} sx={subrowStyle}>
                    <Button
                      size="small"
                      variant='contained'
                      onClick={() => handleSaveHarvestData(harvestItem.id)}
                    >
                      Lagre nytt oppsett
                    </Button>
                  </HarvestTableCell>
                </HarvestTableRow>

                <HarvestTableRow key={harvestItem.id + '-sub-preview'}>

                  <HarvestTableCell colSpan={5} sx={subrowStyle} align={"left"}>
                    Full_location preview: <span id={harvestItem.id + '-sub-preview'}></span>
                  </HarvestTableCell>

                </HarvestTableRow>

              </Fragment>*/}
            ) : (
              <>
                {
                  harvestItem.locationArray.map((loc, idx) => {
                    const content = loc.slice(1, -1); // remove [ and ]
                    const [adress, position, plot] = content.split('|');

                    let uniqeKey = harvestItem.id + '-' + adress + '-' + position;
                    uniqeKey = uniqeKey.replace(/\s+/g, '');

                    return (
                      <HarvestTableRow key={uniqeKey} id={uniqeKey}>
                        <HarvestTableCell sx={subrowStyle}>
                          <TextField
                            label="adress"
                            name="adress"
                            variant="standard"
                            size="small"
                            defaultValue={adress}
                            onChange={(e) => handlePreview(harvestItem.id, 'adress', e.target.value, idx)}
                          />
                        </HarvestTableCell>
                        <HarvestTableCell sx={subrowStyle}>
                          <TextField
                            label="position"
                            name="position"
                            variant="standard"
                            size="small"
                            defaultValue={position}
                            onChange={(e) => handlePreview(harvestItem.id, 'position', e.target.value, idx)}
                          />
                        </HarvestTableCell>
                        <HarvestTableCell sx={subrowStyle}>
                          <TextField
                            label="plot"
                            name="plot"
                            variant="standard"
                            size="small"
                            defaultValue={plot || ''}
                            onChange={(e) => handlePreview(harvestItem.id, 'plot', e.target.value, idx)}
                          />
                        </HarvestTableCell>
                        <HarvestTableCell colSpan={2} sx={subrowStyle}>
                          {idx === 0 ?
                            <Button
                              size="small"
                              variant='contained'
                              onClick={() => handleSaveHarvestData(harvestItem.id)}
                            >
                              Lagre
                            </Button>
                            : null}
                        </HarvestTableCell>
                      </HarvestTableRow>
                    )
                  })
                }
              </>
            )
          }

          {/*
          <HarvestTableRow key={harvestItem.id + '-new-data'}>
            <HarvestTableCell sx={subrowStyle}>
              <TextField
                label="adress"
                name="adress"
                variant="standard"
                size="small"
                defaultValue={''}
                onChange={(e) => handlePreview(harvestItem.id, 'adress', e.target.value, 0)}
              />
            </HarvestTableCell>
            <HarvestTableCell sx={subrowStyle}>
              <TextField
                label="position"
                name="position"
                variant="standard"
                size="small"
                defaultValue={''}
                onChange={(e) => handlePreview(harvestItem.id, 'position', e.target.value, 0)}
              />
            </HarvestTableCell>
            <HarvestTableCell sx={subrowStyle}>
              <TextField
                label="plot"
                name="plot"
                variant="standard"
                size="small"
                defaultValue={''}
                onChange={(e) => handlePreview(harvestItem.id, 'plot', e.target.value, 0)}
              />
            </HarvestTableCell>
            <HarvestTableCell colSpan={2} sx={subrowStyle}></HarvestTableCell>
          </HarvestTableRow>
          */}


        </Fragment>
      ))}

    </HarvestTableBody>

  </HarvestTableWrap>
);

export const TableHeader = ({ columns }) => (
  <HarvestTableWrap>
    <HarvestTableHead>
      <HarvestTableRow sx={{ backgroundColor: '#c3d0a8' }}>
        {
          columns.map(item => (
            <HarvestTableCell key={item.key} sx={mainrowStyle} align={item.align}>
              {item.text}
            </HarvestTableCell>
          ))
        }
      </HarvestTableRow>
    </HarvestTableHead>
  </HarvestTableWrap>
);

export const FixedTableFooter = ({ text, error, responseMessage }) => (
  <HarvestTableWrap sx={{ position: 'fixed', bottom: '-1px', width: '800px', backgroundColor: '#859e91' }}>
    <HarvestTableHead>

      <HarvestTableRow>

        <HarvestTableCell >

          {error || responseMessage ? null : text}

          {error ? ("ERROR: " + error) : null}
          {responseMessage ? (<p>{responseMessage}</p>) : null}

        </HarvestTableCell>

      </HarvestTableRow>

    </HarvestTableHead>
  </HarvestTableWrap>
);