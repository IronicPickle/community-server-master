import React, { Component } from "react";
import { Theme, Typography, withStyles, Card, CardContent, Divider } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { DBMemberDataExtended } from "../../../http_utils/HTTPAuth";

const styles = (theme: Theme) => ({
  profileCard: {
    backgroundColor: theme.palette.primary.dark
  }, profileCardDivider: {
    backgroundColor: theme.palette.secondary.dark,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3)
  },
});

interface Props {
  classes: Classes;
  memberData: DBMemberDataExtended
}

class SubmittedInfo extends Component<Props> {
  
  render() {
    const { classes, memberData } = this.props;

    return (
      <>
        <Card className={classes.profileCard}>
          <CardContent>
            <Typography variant="h6" component="h6" align="center" noWrap
            >Submitted Details</Typography>
            <Divider className={classes.profileCardDivider} />
            <Typography variant="caption" component="p" align="center" noWrap
            >In-Game Name</Typography>
            <Typography variant="body1" component="p" align="center" noWrap
            >{(memberData.inGameName) ? memberData.inGameName : "N/A"}</Typography>
            <Divider className={classes.profileCardDivider} variant="middle" />
            <Typography variant="caption" component="p" align="center" noWrap
            >Inara Name</Typography>
            <Typography variant="body1" component="p" align="center" noWrap
            >{(memberData.inaraName) ? memberData.inaraName : "N/A"}</Typography>

          </CardContent>
        </Card>
      </>
    );
  }
}

export default withStyles(styles)(SubmittedInfo);