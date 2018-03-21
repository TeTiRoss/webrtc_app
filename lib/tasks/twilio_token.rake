namespace :twilio_token do
  desc 'generate twilio access token'
  task generate: :environment do
    # Create an Access Token
    token = Twilio::JWT::AccessToken.new ENV['ACCOUNT_SID'], ENV['API_KEY_SID'], ENV['API_KEY_SECRET'],
      identity: ENV['username'], nbf: nil, ttl: 3600, valid_until: nil

    # Grant access to Video
    grant = Twilio::JWT::AccessToken::VideoGrant.new
    grant.room = 'test'
    token.add_grant grant

    # Serialize the token as a JWT
    puts token.to_jwt
  end
end
