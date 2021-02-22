import React, { Component, MouseEvent } from "react";
import { withStyles, Theme, Grid, Typography, Toolbar, Divider, IconButton, Tooltip, Card, CardContent, Hidden } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import HTTPServers, { DBServer, QueryStatusData, serverTypes } from "../../../http_utils/HTTPServers";
import { globalContext, GlobalContext } from "../../../utils/contexts";
import { authenticate } from "../../../utils/auth";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import PostAddIcon from "@material-ui/icons/PostAdd";

const styles = (theme: Theme) => ({
  mainContainer: {
    backgroundColor: theme.palette.primary.dark,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(1)
  },
  name: {
    
  },
  description: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  footer: {
    padding: 0,
    minHeight: 0,
    marginTop: theme.spacing(2),
  },
  details: {
    marginLeft: theme.spacing(2)
  },
  dividerOnline: {
    backgroundColor: theme.palette.success.dark
  },
  dividerOffline: {
    backgroundColor: theme.palette.error.dark
  },
  statusContainer: {
    minHeight: 0,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  statusName: {
    overflow: "hidden" as "hidden",
    textOverflow: "ellipses" as "ellipses"
  }
});

interface Props {
  classes: ClassNameMap;
  server: DBServer;
  onEdit: (server: DBServer) => (event: MouseEvent<any>) => any;
  onDelete: (server: DBServer) => (event: MouseEvent<any>) => any;
  onCreatePost: (server: DBServer) => (event: MouseEvent<any>) => any;
}

interface State {
  status?: QueryStatusData | null;
}

class ServerBox extends Component<Props, State> {  
  static contextType = globalContext;

  constructor(props: Props) {
    super(props);

    this.state = {}

    this.queryStatus = this.queryStatus.bind(this);

  }

  async queryStatus() {
    const res = await HTTPServers.queryStatus(this.props.server._id);
    if(!res.success || res.data == null) return;
    this.setState({ status: res.data.result });
  }

  componentDidMount() {
    this.queryStatus();
  }

  render() {
    const { classes, server, onEdit, onDelete, onCreatePost } = this.props;
    const { status } = this.state;;
    const { memberData } = this.context as GlobalContext;

    const statusName = (status == null) ? "Offline" : status.name;
    const statusPlayers = (status == null) ? "" : `${status.players.length} / ${status.maxplayers}`;

    return (
      <Card elevation={12} className={classes.mainContainer}>
        <CardContent>
          <Typography
            variant="h5"
            component="h1"
            noWrap
            className={classes.name}
          >{ server.name }
          </Typography>
          
          <Typography                       
            variant="body1"
            component="p"
            noWrap
            className={classes.description}
          >{ server.description }
          </Typography>
          <Divider className={(status == null) ? classes.dividerOffline : classes.dividerOnline} />
          <Toolbar disableGutters className={classes.statusContainer}>
            <Grid container className={classes.statusName}>
              <Tooltip title={statusName}>
                <Typography                       
                  variant="body1"
                  component="p"
                  noWrap
                >{statusName}
                </Typography>
              </Tooltip>
            </Grid>
            <Grid container justify="flex-end">
              <Tooltip title={statusPlayers}>
                <Typography                       
                  variant="body1"
                  component="div"
                  noWrap
                  className={classes.statusPlayers}
                >{statusPlayers}
                </Typography>
              </Tooltip>
            </Grid>
          </Toolbar>
          <Divider className={(status == null) ? classes.dividerOffline : classes.dividerOnline} />
          <Toolbar className={classes.footer}>
            <Grid container justify="flex-start">
              <Typography                       
                variant="body1"
                component="p"
                noWrap
                className={classes.details}
              >
              {serverTypes.find(serverType => serverType.type === server.type)?.name || ""}<br/>
              {server.address}
              {(server.port.length > 0) ? ":" : ""}
              {server.port}
              </Typography>
            </Grid>
            <Grid container justify="flex-end">
              { authenticate("create-serverpost", memberData) &&
                <Tooltip title="Create Post">
                  <IconButton
                    onClick={onCreatePost(server)}
                  >
                    <PostAddIcon />
                  </IconButton>
                </Tooltip> }
              { authenticate("edit-server", memberData) &&
                <Tooltip title="Edit Server">
                  <IconButton
                    onClick={onEdit(server)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip> }
              { authenticate("delete-server", memberData) &&
                <Tooltip title="Delete Server">
                <IconButton
                  onClick={onDelete(server)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip> }
            </Grid>
          </Toolbar>
        </CardContent>
      </Card>
    )
  }
}

export default withStyles(styles)(ServerBox);