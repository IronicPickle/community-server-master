import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Grid, Typography, Theme, Button, Container, FormControl, FormHelperText, TextField, Dialog, DialogContent, Toolbar } from "@material-ui/core";
import { globalContext } from "../../../utils/contexts";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import HTTPNewsPosts, { EditErrors, EditOptions } from "../../../http_utils/HTTPNewsPosts";

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
  titleField: {
    width: 400
  },
  bodyField: {
    width: 400,
    marginTop: theme.spacing(4)
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

class EditNewsPost extends Component<Props, State> {
  static contextType = globalContext;

  private defaultInputs = { _id: "", title: "", body: "" };
  
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

    const res = await HTTPNewsPosts.edit(this.state.inputs);
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
                Edit News Post
              </Typography>
              <Typography
                align="center"
                component="h2"
                className={classes.subTitle}
              >
                {inputs.title}
              </Typography>

              <form name="createNewsPost" onSubmit={this.onSubmit} onError={this.onSubmit}>
                <Grid container direction="column" alignItems="center">
                  <Grid item>
                    <FormControl
                      error={validation.title != null}
                    >
                      <TextField
                        placeholder="An Awesome Title!"
                        label="Title"
                        type="string"
                        name="title"
                        required={true}
                        value={inputs.title}
                        onChange={this.onChange}
                        className={classes.titleField}
                      />
                      <FormHelperText>{validation.title}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <FormControl
                      error={validation.body != null}
                    >
                      <TextField
                        placeholder="An Awesome Annoucement!"
                        label="Content"
                        variant="outlined"
                        type="string"
                        multiline={true}
                        rows={10}
                        name="body"
                        required={true}
                        value={inputs.body}
                        onChange={this.onChange}
                        className={classes.bodyField}
                      />
                      <FormHelperText>{validation.body}</FormHelperText>
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

export default withStyles(styles, { withTheme: true })(EditNewsPost);