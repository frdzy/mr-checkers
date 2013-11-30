Meteor.startup(function() {
  if (CheckersGames.find().count() === 0) {
    Meteor.call('createGame', 'MyGame');
  }
});

