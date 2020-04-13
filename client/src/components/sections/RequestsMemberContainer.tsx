import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Paper, Theme, Button, Container, Slide, Card, CardContent, Divider } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import { GlobalContext } from "../../utils/contexts";
import moment from "moment";

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
  }, messagesContainer: {
    marginTop: theme.spacing(2),
    maxHeight: "45vh",
    overflow: "auto"
  }, messageCard: {
    backgroundColor: theme.palette.primary.dark,
    margin: theme.spacing(1),
    width: 250
  }, messageText: {
    wordWrap: "break-word" as "break-word"
  }, messageDivider: {
    backgroundColor: theme.palette.secondary.dark,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1)
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
  state: boolean;
  data: any;
}

class RequestsMemberContainer extends Component<PropsI> {
  static contextType = GlobalContext;
  
  constructor(props: PropsI) {
    super(props);
    this.state = {
      data: []
    }
  }

  render() {
    const { classes, theme, state, data } = this.props;

    const messages = data.revisionMessages;
    
    return (
      <Slide direction="down" in={state} timeout={500}>
        <Container maxWidth="sm" className={classes.mainContainer} >
          <Paper className={classes.subContainer}>
            <Grid container direction="column" alignItems="center">
              <Grid item>
                <Typography variant="h4" component="h4"
                >Revision Requests</Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6" component="h6" align="center"
                >{data.discordId}</Typography>
              </Grid>
            </Grid>
              <Grid container direction="column" alignItems="center">
                <Grid item className={classes.messagesContainer}>
                  {
                    (messages) ?
                      (messages.length > 0) ?
                        messages.map((message: { _id: string, text: string, date: string }) => {
                          return (
                            <Card key={message._id}>
                              <CardContent className={classes.messageCard}>
                                <Typography variant="body1" component="p" align="center" className={classes.messageText}
                                >{message.text}</Typography>
                                <Divider className={classes.messageDivider} />
                                <Typography variant="body2" component="p" align="center"
                                >{moment(new Date(message.date)).fromNow()}</Typography>
                                <Typography variant="caption" component="p" align="center"
                                >[{moment(new Date(message.date)).format("Do MMM YYYY, hh:mm a")}]</Typography>
                              </CardContent>
                            </Card>
                          )
                        })
                      :
                        <Typography variant="body1" component="p" align="center"
                        >No revison requests have been made</Typography>
                    : <></>
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
    )
  }
}

export default withStyles(styles, { withTheme: true })(RequestsMemberContainer);