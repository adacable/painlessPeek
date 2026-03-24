# Ruby 4.0 removed Object#tainted? and Object#untaint, which Liquid 4.x still calls.
# This patch restores them as no-ops so Jekyll runs on Ruby 4.0.
class Object
  def tainted?
    false
  end

  def untaint
    self
  end
end
