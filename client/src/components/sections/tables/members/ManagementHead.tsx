import { Theme, TableHead, TableRow, TableCell, TableSortLabel, withStyles } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { Component } from "react";
import React from "react";
import { Column } from "./ManagementTable";


const styles = (theme: Theme) => ({
  cell: {
    borderColor: theme.palette.secondary.main,
    borderWidth: 2
  }
});
  
interface PropsI {
  classes: Classes;
  theme: Theme;
  columns: Column[];
  filters: { [key: string]: any };
  onSortButtonClick: (columnName: string) => () => void;
}

class ManagementHead extends Component<PropsI> {

  render() {
    const { classes, columns, filters, onSortButtonClick } = this.props;

    return (
      <>
        <TableHead>
          <TableRow key="head">
            <TableCell key="avatars" align="center" className={classes.cell}></TableCell>
            {
              columns.map(column => {
                return (
                  <TableCell key={column.name} align="center" className={classes.cell}>
                    <TableSortLabel
                      active={filters.sortKey === column.name}
                      direction={(filters.sortDirection === -1) ? "desc" : "asc"}
                      onClick={onSortButtonClick(column.name)}
                      hideSortIcon={true}
                    >{column.title}</TableSortLabel>
                  </TableCell>
                )
              })
            }
          </TableRow>
        </TableHead>
      </>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ManagementHead);