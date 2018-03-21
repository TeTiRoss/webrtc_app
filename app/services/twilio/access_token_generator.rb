class Twilio::AccessTokenGenerator
  def self.call identity
    # Create an Access Token
    token = Twilio::JWT::AccessToken.new ENV['ACCOUNT_SID'], ENV['API_KEY_SID'], ENV['API_KEY_SECRET'],
      identity: identity, nbf: nil, ttl: 3600, valid_until: nil

    # Grant access to Video
    grant = Twilio::JWT::AccessToken::VideoGrant.new
    token.add_grant grant

    # Serialize the token as a JWT
    token.to_jwt
  end
end
