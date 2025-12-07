FROM ruby:3.4.7

COPY Gemfile* /app/
WORKDIR /app
RUN bundle install

CMD ["jekyll", "serve", "--host", "0.0.0.0"]
