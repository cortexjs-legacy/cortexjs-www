var gravatar = require('gravatar').url;

module.exports = function(user) {
  if (!user || typeof user !== 'object') {
    return;
  }

  user.avatar = gravatar(user.email || '', {
    s: 50,
    d: 'mm'
  }, true);

  user.avatarMedium = gravatar(user.email || '', {
    s: 100,
    d: 'mm'
  }, true);

  user.avatarLarge = gravatar(user.email || '', {
    s: 496,
    d: 'mm'
  }, true);

};