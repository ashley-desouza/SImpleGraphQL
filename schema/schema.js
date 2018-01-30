const graphql = require('graphql');
const rp = require('request-promise');

// De-structuring the graphql library
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

// Define the Company Object Type as a GraphQLObjectType
// This definition of the Company Object Type includes the Type name as well as the
// fields that the Type holds and their assoociated Data Types
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return rp({
          uri: `http://localhost:3000/companies/${parentValue.id}/users`,
          json: true
        });
      }
    }
  })
});

// Define the User Object Type as a GraphQLObjectType
// This definition of the User Object Type includes the Type name as well as the
// fields that the Type holds and their assoociated Data Types
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        return rp({
          uri: `http://localhost:3000/companies/${parentValue.companyId}`,
          json: true
        });
      }
    }
  })
});

// Define our RootQueryObject
// This is a critical component as it helps GraphQL identify the entry Node in the Graph Data Structure
// The RootQueryObject will define which Object Type is to be considered as the Root Node
// It also defines what should be the return Data Type as well as the input arguments for that Root Node
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // Define the 'User' Object Node as the Root Node
    user: {
      // Define the return Type
      type: UserType,
      // Define the input arguments for this Root Node
      args: { id: { type: GraphQLString } },
      // Define the Graph Path to traverse
      resolve(parentValue, args) {
        return rp({
          uri: `http://localhost:3000/users/${args.id}`,
          json: true
        });
      }
    },
    company: {
      // Define the return Type
      type: CompanyType,
      // Define the input arguments for this Root Node
      args: { id: { type: GraphQLString } },
      // Define the Graph Path to traverse
      resolve(parentValue, args) {
        return rp({
          uri: `http://localhost:3000/companies/${args.id}`,
          json: true
        });
      }
    }
  }
});

// Define our Mutation Object
// This is another critical component as it helps GraphQL to identify the mutations to perform on Nodes in the Graph
// The Mutation Object defines what mutations are possible on Nodes
// It defines what should be the return type of the mutation resovler as well as the input arguments for that mutation
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      // Define the return Type
      type: UserType,
      // Define the input arguments for this mutator
      args: {
        // Define the firstName field argument to be required.
        // This is done by employing the GraphQLNonNull constructor
        // NOTE: The GraphQLNonNull construtor is very basic. It ONLY checks if the field is empty or not, and no further assertions
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, { firstName, age }) {
        return rp.post({
          uri: `http://localhost:3000/users`,
          body: { firstName, age },
          json: true
        });
      }
    },
    deleteUser: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve(parentValue, { id }) {
        return rp.delete({
          uri: `http://localhost:3000/users/${id}`,
          json: true
        });
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, args) {
        return rp.patch({
          uri: `http://localhost:3000/users/${args.id}`,
          body: args,
          json: true
        });
      }
    }
  }
});

// Export the User schema
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: mutation
});
