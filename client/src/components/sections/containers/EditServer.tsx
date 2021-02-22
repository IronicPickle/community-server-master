import React, { ChangeEvent, Component, FormEvent } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Theme, Button, Container, FormControl, FormHelperText, TextField, Dialog, DialogContent, Toolbar, MenuItem } from "@material-ui/core";
import { globalContext } from "../../../utils/contexts";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import HTTPServers, { EditErrors, EditOptions, serverTypes } from "../../../http_utils/HTTPServers";
import Select from "@material-ui/core/Select";

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
  field: {
    marginTop: theme.spacing(2),
    width: 300
  },
  button: {
    minWidth: theme.spacing(12),
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1)
  }
});

interface Props {
  classes: ClassNameMap;
  theme: Theme;
  state: boolean;
  inputs: EditOptions;
  onClose: () => any;
}
interface State {
  inputs: EditOptions;
  validation: EditErrors;
}

class EditServer extends Component<Props, State> {
  static contextType = globalContext;

  private defaultInputs = { _id: "", name: "", description: "", type: "minecraft" as "minecraft", address: "", port: "" };
  
  constructor(props: Props) {
    super(props);
    this.state = {
      inputs: JSON.parse(JSON.stringify(this.defaultInputs)),
      validation: {}
    }
    
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(event: ChangeEvent<HTMLTextAreaElement | { name?: string | undefined; value: unknown; }>) {
    if(event.target.name == null) return;
    const inputs = this.state.inputs;
    inputs[event.target.name] = event.target.value;
    this.setState({ inputs });
  }

  async onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    this.context.toggleLoader(true);

    const res = await HTTPServers.edit(this.state.inputs);
    this.context.toggleLoader(false);
    this.context.toggleNotification(true, {
      type: (res.success) ? "success" : "error", message: res.msg, hideDelay: 2000
    });
    if(res.errors) this.setState({ validation: res.errors });
    if(!res.success) return;
    this.props.onClose();
    this.setState({ inputs: JSON.parse(JSON.stringify(this.defaultInputs)) });
  }

  componentDidUpdate() {
    if(this.state.inputs._id !== this.props.inputs._id && this.props.state) {
      this.setState({ inputs: JSON.parse(JSON.stringify(this.props.inputs)) });
    }
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
                Edit Server
              </Typography>
              <Typography
                align="center"
                component="h2"
                className={classes.subTitle}
              >
                {inputs.name}
              </Typography>

              <form name="editServer" onSubmit={this.onSubmit} onError={this.onSubmit}>
                <Grid container direction="column" alignItems="center">
                  <Grid item>
                    <FormControl error={validation.type != null} >
                      <Select
                        name="type"
                        required={true}
                        value={inputs.type}
                        onChange={this.onChange}
                        className={classes.field}
                      >
                        { serverTypes.map((serverType, i) => {
                            return <MenuItem key={i} value={serverType.type}>{serverType.name}</MenuItem>
                          }) }
                      </Select>
                      <FormHelperText>{validation.type}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <FormControl error={validation.name != null} >
                      <TextField
                        placeholder="A Name for your Server"
                        label="Server Name"
                        variant="standard"
                        type="string"
                        name="name"
                        required={true}
                        value={inputs.name}
                        onChange={this.onChange}
                        className={classes.field}
                      />
                      <FormHelperText>{validation.name}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <FormControl error={validation.description != null} >
                      <TextField
                        placeholder="A Description of your Server"
                        label="Server Description"
                        variant="standard"
                        type="string"
                        name="description"
                        required={true}
                        value={inputs.description}
                        onChange={this.onChange}
                        className={classes.field}
                      />
                      <FormHelperText>{validation.description}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <FormControl error={validation.address != null} >
                      <TextField
                        placeholder="The Address of Your Server"
                        label="Server Address"
                        variant="standard"
                        type="string"
                        name="address"
                        required={true}
                        value={inputs.address}
                        onChange={this.onChange}
                        className={classes.field}
                      />
                      <FormHelperText>{validation.address}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <FormControl error={validation.port != null} >
                      <TextField
                        placeholder="A Port of your Server"
                        label="Server Port"
                        variant="standard"
                        type="string"
                        name="port"
                        value={inputs.port}
                        onChange={this.onChange}
                        className={classes.field}
                      />
                      <FormHelperText>{validation.port}</FormHelperText>
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

export default withStyles(styles, { withTheme: true })(EditServer);