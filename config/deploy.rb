# config valid only for Capistrano 3.1
lock '>=3.2.1'

set :application, 'bloodhound'
set :repo_url, 'git@github.com:EvilMouseStudios/bloodhound.git'
set :linked_dirs, %w{node_modules}
