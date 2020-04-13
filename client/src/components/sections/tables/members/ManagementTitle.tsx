import { Theme, withStyles, Toolbar, Typography, Grid, TextField, Paper, IconButton, Tooltip } from "@material-ui/core";
import { Classes } from "jss";
import { Component } from "react";
import React from "react";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import { GlobalContext } from "../../../../utils/contexts";


const styles = (theme: Theme) => ({
  createMemberButton: {
    marginRight: theme.spacing(1)
  }, searchBar: {
    width: 250
  },

  colorWash: {
    color: theme.palette.primary.contrastText + " !important",
    "&:before": {borderColor: theme.palette.secondary.main},
    "&:after": {borderColor: theme.palette.secondary.main}
  }
});
  
interface PropsI {
  classes: Classes;
  theme: Theme;
  filteredColumn: { [key: string]: any };
  onSearchBarChange: any;
  updateTable: Function;
}

class ManagementTitle extends Component<PropsI> {
  static contextType = GlobalContext;

  render() {
    const { classes, filteredColumn, onSearchBarChange, updateTable } = this.props;

    return (
      <Paper>
        <Toolbar>
          <Grid container justify="flex-start">
            <Grid item>
              <Typography
                variant="h6"
                component="h6"
              >Squadron Management</Typography>
            </Grid>
          </Grid>
          <Grid container justify="flex-end">
            <Grid item>
              <Toolbar style={{padding: 0}}>
                <IconButton
                  color="secondary"
                  aria-label="create member"
                  onClick={() => { this.context.toggleContainer("createMember", true, () => { updateTable(); }) }}
                  className={classes.createMemberButton}
                >
                  <Tooltip title="Create Member" aria-label="create member">
                    <AddCircleOutlineIcon />
                  </Tooltip>
                </IconButton>
                <TextField
                  id="search"
                  label="Search"
                  type="string"
                  variant="filled"
                  placeholder={filteredColumn.title}
                  onChange={onSearchBarChange}
                  InputProps={{
                    classes: {
                      root: classes.colorWash
                    }
                  }}
                  InputLabelProps={{
                    classes: {
                      shrink: classes.colorWash
                    }
                  }}
                  className={classes.searchBar}
                />
              </Toolbar>
            </Grid>
          </Grid>
        </Toolbar>
      </Paper>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ManagementTitle);