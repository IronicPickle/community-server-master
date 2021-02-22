import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Theme, Button, Container, FormControl, FormHelperText, TextField, Dialog, DialogContent, Toolbar } from "@material-ui/core";
import { globalContext } from "../../../utils/contexts";
import HTTPMembers, { CreateOptions } from "../../../http_utils/HTTPMembers";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import { CreateErrors } from "../../../http_utils/HTTPMembers";

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
  textField: {
    width: 250
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
  onClose: () => any;
}
interface State {
  inputs: CreateOptions;
  validation: CreateErrors;
}

class CreateMember extends Component<Props, State> {
  static contextType = globalContext;

  private defaultInputs = { discordId: "" };
  
  constructor(props: Props) {
    super(props);
    this.state = {
      inputs: JSON.parse(JSON.stringify(this.defaultInputs)),
      validation: {}
    }
    
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const inputs = this.state.inputs;
    inputs[event.target.name] = event.target.value;
    this.setState({ inputs });
  }

  async onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    this.context.toggleLoader(true);

    const res = await HTTPMembers.create(this.state.inputs);
    this.context.toggleLoader(false);
    this.context.toggleNotification(true, {
      type: (res.success) ? "success" : "error", message: res.msg, hideDelay: 2000
    });
    if(res.errors) this.setState({ validation: res.errors });
    if(!res.success) return;
    this.setState({ inputs: JSON.parse(JSON.stringify(this.defaultInputs)) });
    this.props.onClose();
  }

  render() {
    const { classes, state, onClose } = this.props;
    const { inputs, validation } = this.state;
    
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
                Create Member
              </Typography>
              <Typography
                align="center"
                component="h2"
                className={classes.subTitle}
              >
                Add a Member to the Database
              </Typography>

              <form name="createMemberForm" onSubmit={this.onSubmit} onError={this.onSubmit}>
                <Grid container direction="column" alignItems="center">
                  <Grid item>
                    <FormControl
                      error={validation.discordId != null}
                    >
                      <TextField
                        placeholder="18 Digit User ID"
                        label="Discord ID"
                        type="string"
                        name="discordId"
                        required={true}
                        value={inputs.discordId}
                        onChange={this.onChange}
                        className={classes.textField}
                      />
                      <FormHelperText>{validation.discordId}</FormHelperText>
                    </FormControl>
                  </Grid>
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

export default withStyles(styles, { withTheme: true })(CreateMember);