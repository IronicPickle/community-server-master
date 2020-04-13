import { Theme, TableHead, TableRow, TableCell, TableSortLabel, withStyles } from "@material-ui/core";
import { Classes } from "jss";
import { Component } from "react";
import React from "react";


const styles = (theme: Theme) => ({
  cell: {
    borderColor: theme.palette.secondary.main,
    borderWidth: 2
  }
});
  
interface PropsI {
  classes: Classes;
  theme: Theme;
  tableColumns: { [key: string]: any }[];
  filters: { [key: string]: any };
  onSortButtonClick: Function;
}

class ManagementHead extends Component<PropsI> {

  render() {
    const { classes, tableColumns, filters, onSortButtonClick } = this.props;

    return (
      <TableHead>
        <TableRow key="head">
          {
            tableColumns.map(column => {
              return (
                <TableCell key={column.name} align="center" className={classes.cell}>
                  <TableSortLabel
                    active={filters.sortId === column.name}
                    direction={filters.sortDirection}
                    onClick={onSortButtonClick(column.name)}
                    hideSortIcon={true}
                  >{column.title}</TableSortLabel>
                </TableCell>
              )
            })
          }
          <TableCell key="actions1" align="center" className={classes.cell}></TableCell>
          <TableCell key="actions2" align="center" className={classes.cell}></TableCell>
        </TableRow>
      </TableHead>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ManagementHead);