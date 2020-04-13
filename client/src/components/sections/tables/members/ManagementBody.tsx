import { Theme, TableRow, TableCell, withStyles, TableBody, Checkbox, IconButton, Tooltip } from "@material-ui/core";
import { Classes } from "jss";
import { Component } from "react";
import React from "react";
import ClearIcon from "@material-ui/icons/Clear";
import CheckIcon from "@material-ui/icons/Check";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";


const styles = (theme: Theme) => ({
  cell: {
    borderColor: theme.palette.secondary.main,
    borderWidth: 1
  }
});
  
interface PropsI {
  classes: Classes;
  theme: Theme;
  tableColumns: { [key: string]: any }[];
  rows: { [key: string]: any }[];
  rowsCopy: { [key: string]: any }[];
  onCheckboxChange: Function;
  onIconButtonClick: Function
}

class ManagementHead extends Component<PropsI> {

  render() {
    const { classes, rows, rowsCopy, tableColumns, onCheckboxChange, onIconButtonClick } = this.props;

    return (
      <TableBody>
        {
          rowsCopy.map(row => {
            return (
              <TableRow key={row._id}>
                {
                  tableColumns.map(column => {
                    return (
                      <TableCell key={`${column.name}_${row._id}`} align="center" className={classes.cell} style={(row.confirmedByAdmiralty) ? {opacity: 0.4} : {}}>
                        {
                          (column.isBool) ? 
                            <Checkbox
                              onChange={
                                (!column.disabled) ?
                                  onCheckboxChange(rows.map(row1 => {
                                    return row1._id;
                                  }).indexOf(row._id), column.name)
                                  : () => {}
                              }
                              value={row[column.name]}
                              checked={row[column.name]}
                              disableRipple={row.confirmedByAdmiralty || column.disabled}
                              disabled={true}
                            />
                          : row[column.name]
                        }
                      </TableCell>
                    )
                  })
                }
                <TableCell key={`actions1_${row._id}`} align="center" className={classes.cell}>
                  
                  {
                    (
                      row.applicationStatus.stage === 1 &&
                      row.joinedPrivateGroup &&
                      row.inaraName.length > 0 &&
                      row.inGameName.length > 0
                    ) ?
                      <IconButton onClick={onIconButtonClick("complete", { _id: row._id })} color="secondary">
                        <Tooltip title="Complete Application" aria-label="complete application">
                          <CheckIcon color="secondary"/>
                        </Tooltip>
                      </IconButton>
                    :
                      (row.applicationStatus.stage === 2) ?
                        <IconButton onClick={onIconButtonClick("revert", { _id: row._id })} color="secondary">
                          <Tooltip title="Revert Application" aria-label="revert application">
                            <ClearIcon color="secondary"/>
                          </Tooltip>
                        </IconButton>
                      : <></>
                  }
                  {
                    (row.applicationStatus.stage === 1) ?
                      <IconButton onClick={onIconButtonClick("request", { _id: row._id })} color="secondary">
                        {
                          <Tooltip title="Request Revision" aria-label="request revision">
                            <NotificationsActiveIcon color="secondary"/>
                          </Tooltip>
                        }
                      </IconButton>
                    : null
                  }
                </TableCell>
                <TableCell key={`actions2_${row._id}`} align="center" className={classes.cell}>
                  {
                    (row.applicationStatus.stage !== 2) ?
                      <IconButton onClick={onIconButtonClick("edit", { _id: row._id })} color="secondary">
                        <Tooltip title="Edit" aria-label="edit member">
                          <EditIcon color="secondary"/>
                        </Tooltip>
                      </IconButton>
                    : <></>
                  }
                  <IconButton onClick={onIconButtonClick("requests", { _id: row._id })} color="secondary">
                      <Tooltip title="View Revision Requests" aria-label="review revision messages">
                        <VisibilityIcon color="secondary"/>
                      </Tooltip>
                  </IconButton>
                </TableCell>
              </TableRow>
            )
          })
        }
      </TableBody>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ManagementHead);