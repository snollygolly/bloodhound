server '', user: '', roles: %w{web}

set :branch, 'development'
set :deploy_to, ''

set :ssh_options, {
  forward_agent: true,
}

namespace :deploy do

    task :npm_install do
      on roles :all do
        execute "cd #{release_path} && npm install"
      end
    end

    after :publishing, :npm_install

    task :restart do
      on roles :all do
        execute "sudo stop #{fetch(:application)}-dev", raise_on_non_zero_exit: false
        execute "sudo start #{fetch(:application)}-dev"
      end
    end

    after :npm_install, :restart

end
