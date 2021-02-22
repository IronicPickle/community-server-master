import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Theme, Button, Container, Dialog, DialogContent, Toolbar } from "@material-ui/core";
import { globalContext } from "../../../utils/contexts";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import HTTPServers, { DeleteOptions } from "../../../http_utils/HTTPServers";

const styles = (theme: Theme) => ({
  mainContainer: {
    padding: theme.spacing(2)
  },
  title: {
    marginBottom: theme.spacing(2)
  },
  subTitle: {
    marginBottom: theme.spacing(4)
  },
  button: {
    minWidth: theme.spacing(12),
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1)
  }
});

interface Props {
  classes: ClassNameMap;
  state: boolean;
  inputs: DeleteOptions;
  onClose: () => any;
}

class DeleteServer extends Component<Props> {
  static contextType = globalContext;
  
  constructor(props: Props) {
    super(props);
    this.state = {}
    
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    this.context.toggleLoader(true);

    const res = await HTTPServers.delete(this.props.inputs._id);
    this.context.toggleLoader(false);
    this.context.toggleNotification(true, {
      type: (res.success) ? "success" : "error", message: res.msg, hideDelay: 2000
    });
    if(!res.success) return;
    this.props.onClose();
  }

  render() {
    const { classes, state, inputs, onClose } = this.props;
    
    return (
      <>
        <Dialog open={state} onClose={onClose}>
          <DialogContent>
            <Container className={classes.mainContainer} >

              <Typography
                align="center"
                variant="h4"
                component="h1"
                className={classes.title}
              >
                Delete Server
              </Typography>
              <Typography
                align="center"
                component="h2"
                className={classes.subTitle}
              >
                {inputs.name}
              </Typography>

              <form name="deleteServer" onSubmit={this.onSubmit} onError={this.onSubmit}>
                <Grid container direction="column" alignItems="center">
                  <Grid item className={classes.button}>
                    <Toolbar disableGutters>
                      <Button
                        type="submit"
                        color="secondary"
                        size="small"
                        variant="outlined"
                        className={classes.button}
                      >Continue</Button>
                      <Button
                        type="button"
                        color="primary"
                        size="small"
                        variant="contained"
                        onClick={() => { onClose() }}
                        className={classes.button}
                      >Cancel</Button>
                    </Toolbar>
                  </Grid>
                </Grid>
              </form>
            </Container>
          </DialogContent>
        </Dialog>
      </>
    )
  }
}

export default withStyles(styles, { withTheme: true })(DeleteServer);