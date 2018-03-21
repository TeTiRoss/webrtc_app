class Api::TokensController < Api::BaseController
  def create
    render json: { token: Twilio::AccessTokenGenerator.call(params[:identity]) }
  end
end
