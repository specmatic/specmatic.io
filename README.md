# Specmatic Documentation

Documentation for [Specmatic](https://specmatic.io)

## Workflow

* Download the zip file from wordpress
* Copy the zip file to `tmp/website.zip`
* Execute the following code in terminal/powershell
  ```shell
  git pull --rebase

  # clean up the entire contents, unpack the new website, and setup redirects
  rake all # for mac/linux
  doit.ps1 # windows powershell, if you have it installed
  docker compose up --build # to preview the website. Open http://localhost:4000 in your browser
  git add .
  git commit -m 'Your commit message'
  git push
  ```

> Note: For any extra files that need to be hosted, Just put them under the `extra-files` folder
