import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Paper, Theme, Button, Container, Slide, Card, CardContent, Divider, Toolbar, Avatar } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../../../utils/contexts";
import moment from "moment";
import { DBMemberData } from "../../../http_utils/HTTPMembers";

const styles = (theme: Theme) => ({
  mainContainer: {
    position: "fixed" as "fixed",
    top: 0,
    right: 0,
    left: 0,
    zIndex: theme.zIndex.tooltip,
    padding: 0,
    marginTop: "15vh",
    maxHeight: "70vh",
    overflow: "auto"
  }, subContainer: {
    padding: theme.spacing(4)
  }, subTitle: {
    maxWidth: theme.spacing(48),
    overflow: "hidden" as "hidden",
    whiteSpace: "nowrap" as "nowrap"
  }, messagesContainer: {
    marginTop: theme.spacing(2),
    maxHeight: "45vh",
    overflow: "auto"
  }, messageCard: {
    backgroundColor: theme.palette.primary.dark,
    margin: theme.spacing(1),
    width: 250
  }, messageText: {
    wordWrap: "break-word" as "break-word",
    whiteSpace: "pre-wrap" as "pre-wrap"
  }, messageDivider: {
    backgroundColor: theme.palette.secondary.dark,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }, discordName: {
    maxWidth: theme.spacing(18),
    textOverflow: "ellipsis",
    overflow: "hidden" as "hidden"
  },

  colorWash: {
    color: theme.palette.primary.contrastText + " !important",
    "&:before": {borderColor: theme.palette.secondary.main},
    "&:after": {borderColor: theme.palette.secondary.main}
  }
});

interface Props {
  classes: Classes;
  theme: Theme;
  state: boolean;
  data?: DBMemberData;
}

class RequestsMemberContainer extends Component<Props> {
  static contextType = GlobalContext;

  render() {
    const { classes, theme, state, data } = this.props;

    if(!data) return null;

    const messages = data.revisionMessages;
    if(messages) messages.reverse();
    
    return (
      <>
        <Slide direction="down" in={state} timeout={500}>
          <Container maxWidth="sm" className={classes.mainContainer} >
            <Paper className={classes.subContainer}>
              <Grid container direction="column" alignItems="center">
                <Grid item>
                  <Typography variant="h4" component="h4"
                  >Revision Requests</Typography>
                </Grid>
                <Toolbar className={classes.subTitle}>
                  <Typography variant="h6" component="h6"
                  >Revision Requests of </Typography>
                  <Avatar alt={data.discordName} src={data.discordAvatar} style={{ margin: theme.spacing(1) }}
                  >{(data.discordName + "").charAt(0).toUpperCase()}</Avatar>
                  <Typography variant="h6" component="h6"
                  >{data.discordName}</Typography>
                </Toolbar>
              </Grid>
                <Grid container direction="column" alignItems="center">
                  <Grid item className={classes.messagesContainer}>
                    {
                      (messages) ?
                        (messages.length > 0) ?
                          messages.map(message => {
                            return (
                              <Card key={message._id}>
                                <CardContent className={classes.messageCard}>
                                  <Typography variant="body1" component="p" align="center" className={classes.messageText}
                                  >{message.text}</Typography>
                                  <Divider className={classes.messageDivider} />
                                  <Typography variant="body2" component="p" align="center"
                                  >{moment(new Date(message.creationDate)).fromNow()}</Typography>
                                  <Typography variant="caption" component="p" align="center"
                                  >[{moment(new Date(message.creationDate)).format("Do MMM YYYY, hh:mm a")}]</Typography>
                                  <Divider className={classes.messageDivider} />
                                  <Grid container justify="center">
                                    <Grid item>
                                    <Toolbar style={{ minHeight: 0 }}>
                                      <Typography variant="body2" component="p"
                                      >by </Typography>
                                      <Avatar alt={message.author.discordName} src={message.author.discordAvatar}
                                        style={{
                                          marginRight: theme.spacing(1),
                                          marginLeft: theme.spacing(1)
                                        }}
                                      >{message.author.discordName.charAt(0).toUpperCase()}</Avatar>
                                      <Typography variant="body2" component="p" className={classes.discordName}
                                      >{message.author.discordName}</Typography>
                                      </Toolbar>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                              </Card>
                            )
                          })
                        :
                          <Typography variant="body1" component="p" align="center"
                          >No revison requests have been made</Typography>
                      : null
                    }
                  </Grid>
                  <Grid item style={{marginTop: theme.spacing(2)}}>
                    <Button
                      type="button"
                      color="primary"
                      size="small"
                      variant="contained"
                      onClick={() => { this.context.toggleBackdrop(false, true); }}
                      style={{marginLeft: theme.spacing(2)}}
                    >Close</Button>
                  </Grid>
                </Grid>
            </Paper>
          </Container>
        </Slide>
      </>
    )
  }
}

export default withStyles(styles, { withTheme: true })(RequestsMemberContainer);