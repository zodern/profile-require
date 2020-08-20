Package.describe({
  name: 'zodern:profile-require',
  summary: 'Profile client imports to identify files impacting load time',
  version: '1.0.0',
  git: 'https://github.com/zodern/profile-require.git',
});


Package.onUse(api => {
  // We only want meteorInstall
  api.versionsFrom("METEOR@1.7");

  api.use('modules-runtime');
  api.use('meteor');
  api.addFiles('client.js', 'client');
});
