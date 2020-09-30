/**
 * DIRECTION AND ADJACENT NODES
 *
 * User - HasPrivateInformation -> UserPrivate
 * Post - CreatedBy -> User
 * Post - Tagged -> User
 * Post - References -> Post
 * Post - References -> Highlight
 * Post - HasUrl -> URL
 * URL - HasDomain -> Domain
 */
enum Relationship {
  HasPrivateInformation = 'HAS_PRIVATE_INFORMATION',
  CreatedBy = 'CREATED_BY',
  Tagged = 'TAGGED',
  References = 'REFERENCES',
  HasUrl = 'HAS_URL',
  HasDomain = 'HAS_DOMAIN',
}

export default Relationship;
