import React, { Component } from "react";
import { Theme, Typography, Divider, Grid, withTheme } from "@material-ui/core";
import { DBMemberDataExtended } from "../../../http_utils/HTTPAuth";

interface Props {
  theme: Theme;
  memberData: DBMemberDataExtended;
}

class ApplicationProgress extends Component<Props> {
  
  render() {
    const { theme, memberData } = this.props;

    const applicationStatus = memberData.applicationStatus;

    return (
      <>
        <Grid container justify="space-around" wrap="nowrap" style={{ marginLeft: theme.spacing(2) }}>
          <Grid item sm={2}>
            <Typography variant="caption" component="p" align="center" noWrap
              >Stage 1</Typography>
            <Typography variant="body1" component="p" align="center" noWrap
              style={{ color: theme.palette.success.main }}
              >Not Started</Typography>
          </Grid>
          <Grid item sm={3}>
            <Divider variant="middle" style={{
                backgroundColor: (applicationStatus.stage >= 1) ?
                  theme.palette.success.main
                : theme.palette.error.main,
                marginTop: theme.spacing(4)
              }} />
          </Grid>
          <Grid item sm={2}>
            <Typography variant="caption" component="p" align="center" noWrap
              >Stage 2</Typography>
            <Typography variant="body1" component="p" align="center" noWrap
              style={{
                color: (applicationStatus.stage >= 1) ?
                  theme.palette.success.main
                : theme.palette.error.main,
              }}
              >In Progress</Typography>
          </Grid>
          <Grid item sm={3}>
            <Divider variant="middle" style={{
                backgroundColor: (applicationStatus.stage >= 2) ?
                  theme.palette.success.main
                : theme.palette.error.main,
                marginTop: theme.spacing(4)
              }} />
          </Grid>
          <Grid item sm={2}>
            <Typography variant="caption" component="p" align="center" noWrap
              >Stage 3</Typography>
            <Typography variant="body1" component="p" align="center" noWrap
              style={{
                color: (applicationStatus.stage >= 2) ?
                theme.palette.success.main
              : theme.palette.error.main,
              }}
              >Reviewed</Typography>
          </Grid>
          <Grid item sm={3}>
            <Divider variant="middle" style={{
                backgroundColor: (applicationStatus.stage === 3) ?
                  theme.palette.success.main
                : (applicationStatus.stage >= 3) ?
                    theme.palette.success.main
                  : theme.palette.error.main,
                marginTop: theme.spacing(4)
              }} />
          </Grid>
          <Grid item sm={2}>
            <Typography variant="caption" component="p" align="center" noWrap
              >Stage 4</Typography>
            <Typography variant="body1" component="p" align="center" noWrap
              style={{
                color: (applicationStatus.stage >= 3) ?
                  theme.palette.success.main
                : theme.palette.error.main,
              }}
              >Completed</Typography>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withTheme(ApplicationProgress);