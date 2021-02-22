import { Theme, TableHead, TableRow, TableCell, TableSortLabel, withStyles } from "@material-ui/core";
import { Component } from "react";
import React from "react";
import { Column } from "./ManagementTable";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";


const styles = (theme: Theme) => ({
  cell: {
    borderWidth: 2,
    width: "33.3%"
  }
});
  
interface PropsI {
  classes: ClassNameMap;
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
            {
              columns.map(column => {
                return (
                  <TableCell key={column.name} align="center" variant="head" className={classes.cell}>
                    {
                      (column.sortable) ?
                        <TableSortLabel
                          active={filters.sortKey === column.name}
                          direction={(filters.sortDirection === -1) ? "desc" : "asc"}
                          onClick={onSortButtonClick(column.name)}
                        >{column.title}</TableSortLabel>
                      :
                        <TableSortLabel hideSortIcon={true}>{column.title}</TableSortLabel>
                    }
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