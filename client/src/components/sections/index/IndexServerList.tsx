import React, { Component, MouseEvent } from "react";
import { withStyles, Theme, Paper, Grid, Typography, Toolbar, Divider, Button, Grow } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import HTTPServers, { DBServer } from "../../../http_utils/HTTPServers";
import StorageIcon from "@material-ui/icons/Storage";
import { globalContext, GlobalContext } from "../../../utils/contexts";
import { authenticate } from "../../../utils/auth";
import EditServer from "../containers/EditServer";
import DeleteServer from "../containers/DeleteServer";
import CreateServer from "../containers/CreateServer";
import CreateServerPost from "../containers/CreateServerPost";
import ServerBox from "./ServerBox";

const styles = (theme: Theme) => ({
  mainContainer: {
    marginTop: theme.spacing(4),
    minHeight: theme.spacing(40),

    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4)
  },
  titleContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3)
  },
  titleIcon: {
    width: theme.spacing(6),
    height: theme.spacing(6)
  },
  cardParentContainer: {
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  cardContainer: {
    backgroundColor: theme.palette.primary.dark,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(1)
  },
  serverName: {
    
  },
  serverDescription: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  serverFooter: {
    padding: 0,
    minHeight: 0,
    marginTop: theme.spacing(2),
  },
  serverDetails: {
    marginLeft: theme.spacing(2)
  }
});

interface Props {
  classes: ClassNameMap;
}

interface State {
  servers: DBServer[];
  serversTotal: number;
  createState: boolean;
  editState: boolean;
  deleteState: boolean;
  createPostState: boolean;
  currentServer: DBServer;
}

class IndexServerList extends Component<Props, State> {
  static contextType = globalContext;

  constructor(props: Props) {
    super(props);

    this.state = {
      servers: [],
      serversTotal: 0,
      createState: false,
      editState: false,
      deleteState: false,
      createPostState: false,
      currentServer: {} as DBServer
    }

    this.updateServers = this.updateServers.bind(this);
    this.openCreate = this.openCreate.bind(this);
    this.openEdit = this.openEdit.bind(this);
    this.openDelete = this.openDelete.bind(this);
    this.openCreatePost = this.openCreatePost.bind(this);
  }


  async updateServers() {
    const res = await HTTPServers.query();
    if(!res.success || res.data == null) return;
    this.setState({ servers: res.data.servers, serversTotal: res.data.serversTotal })
  }

  openCreate() {
    this.setState({ createState: true });
  }

  openEdit(server: DBServer) {
    return (event: MouseEvent<HTMLButtonElement>) => {
      this.setState({ editState: true, currentServer: server });
    }
  }

  openDelete(server: DBServer) {
    return (event: MouseEvent<HTMLButtonElement>) => {
      this.setState({ deleteState: true, currentServer: server });
    }
  }

  openCreatePost(server: DBServer) {
    return (event: MouseEvent<HTMLButtonElement>) => {
      this.setState({ createPostState: true, currentServer: server });
    }
  }

  componentDidMount() {
    this.updateServers();
  }

  render() {
    const { classes } = this.props;
    const { servers, createState, editState, deleteState, createPostState, currentServer } = this.state;
    const { memberData } = this.context as GlobalContext;

    return (
      <>
        <CreateServer state={createState} onClose={() => {
          this.setState({ createState: false });
          this.updateServers();
        }} />
        <EditServer state={editState} onClose={() => {
          this.setState({ editState: false });
          this.updateServers();
        }} inputs={currentServer} />
        <DeleteServer state={deleteState} onClose={() => {
          this.setState({ deleteState: false });
          this.updateServers();
        }} inputs={currentServer} />
        <CreateServerPost state={createPostState} onClose={() => {
          this.setState({ createPostState: false });
          this.updateServers();
        }} server={currentServer} />
        <Paper className={classes.mainContainer} elevation={24}>
          <Toolbar className={classes.titleContainer}>
            <Grid container justify="flex-start">
              <Toolbar style={{ padding: 0 }}>
                <StorageIcon className={classes.titleIcon}/>
              </Toolbar>
            </Grid>
            <Grid container justify="center">
              <Toolbar style={{ padding: 0 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  align="center"
                  noWrap
                >Servers
                </Typography>
              </Toolbar>
            </Grid>
            <Grid container justify="flex-end">
              { authenticate("create-server", memberData) &&
                <Toolbar style={{ padding: 0 }}>
                  <Button
                    type="button"
                    color="secondary"
                    size="medium"
                    variant="outlined"
                    onClick={this.openCreate}
                    className={classes.button}
                  >Create Server</Button>
                </Toolbar> }
            </Grid>
          </Toolbar>
          <Divider />
          <Grid
            container
            direction="row"
            alignContent="center"
            spacing={4}
            className={classes.cardParentContainer}
          >
            { servers.length > 0 &&
              (
                servers.map((server, i) => {
                  let timeout = (i - (servers.length - 11)) * 250;
                  if(timeout < 0) timeout = 0;
                  return (
                    <Grow key={i} in={true} timeout={timeout}>
                      <Grid item xs={4}>
                        <ServerBox
                          server={server}
                          onCreatePost={this.openCreatePost}
                          onEdit={this.openEdit}
                          onDelete={this.openDelete}
                        />
                      </Grid>
                    </Grow>
                  )
                })
              )
            }
          </Grid>
        </Paper>
      </>
    );
  }
}

export default withStyles(styles)(IndexServerList);