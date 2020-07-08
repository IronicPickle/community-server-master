import React, { Component } from "react";
import { withStyles, Theme, Container, Paper, Grid, Divider } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import BannerTitle from "../components/sections/index/BannerTitle";
import BannerBody from "../components/sections/index/BannerBody";
import { Link } from "react-router-dom";

const styles = (theme: Theme) => ({
  mainContainer: {
    minWidth: 800,
    marginTop: theme.spacing(12),
    marginBottom: theme.spacing(8)
  }, titleContainer: {
    marginBottom: theme.spacing(4),
    paddingRight: theme.spacing(8),
    paddingLeft: theme.spacing(8),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }, titleImage: {
    height: theme.spacing(12),
    marginRight: theme.spacing(2)
  }, divider: {
    backgroundColor: theme.palette.secondary.dark,
    margin: theme.spacing(2)
  }
});

interface Props {
  classes: Classes;
}

class Index extends Component<Props> {  
  render() {
    const { classes } = this.props;

    return (
      <>
        <Container className={classes.mainContainer}>
          <Grid container justify="center">
            <Grid item>
              <Paper className={classes.titleContainer}>
                <img src="/images/banner.png" alt="IP3X Banner" className={classes.titleImage} />
              </Paper>
            </Grid>
          </Grid>
          <BannerTitle content="Welcome to Interplanetary Expeditions" />
          <BannerBody imageSrc="/images/badge.png" content={
            <>
              We are Interplanetary Expeditions!<br/>
              Though you might find it easier to call us IP3X.<br/>
              <Divider className={classes.divider} variant="middle" />
              We are a variety squadron with no particular focus,<br/>
              though we mostly do mining, combat and BGS.<br/>
              Anyone is welcome to join and it doesn't take long to do so.<br/>
              <Divider className={classes.divider} variant="middle" />
              We are primarily based in Europe and play exculsively on PC.<br/>
              Keep scrolling to find out how to join.
            </>
          } />
          <BannerTitle reverse link="https://discord.gg/FT5dKKH" content="Become a Member" />
          <BannerBody reverse imageSrc="/images/discord_logo_white.png" content={
            <>
              Looking to become a member?<br/>
              Simply join our <a href="https://discord.gg/FT5dKKH"><u>discord</u></a> and start your application<br/>
              <Divider className={classes.divider} variant="middle" />
              Don't worry, it's not a long process and we don't ask much.<br/>
              The process is mostly automated and doesn't take long.<br/>
              <Divider className={classes.divider} variant="middle" />
              All we need is you to join our squadron both in-game and on <a href="https://inara.cz/squadron/6172/"><u>Inara.cz</u></a>,<br/>
              along with your usernames on both.<br/>
              If you've never heard if Inara, don't worry, we will help you out.<br/>
            </>
          } />
          <BannerTitle link="/login" content="Login to Track your Application" />
          <BannerBody imageSrc="/images/squadrons.png" content={
            <>
              Once you have joined our Discord, you can <Link to="/login"><u>log into</u></Link> our website using your Discord account.<br/>
              <Divider className={classes.divider} variant="middle" />
              This allows you to track your application as it progresses,<br/>
              alongside the details you've submitted and any revision requests made by an admiral.<br/>
              <Divider className={classes.divider} variant="middle" />
              In case you're worried about security, it's not a necessary step,<br/>
              but it can be a little easier than tracking it via Discord.<br/>
            </>
          } />
        </Container>
      </>
    );
  }
}

export default withStyles(styles)(Index);