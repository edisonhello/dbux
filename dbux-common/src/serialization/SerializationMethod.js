import Enum from '../util/Enum';

/**
 * 
 */
let SerializationMethod = {
  Function: 1,
  ToString: 2,
  // Object: 3
  JSON: 3
};

SerializationMethod = new Enum(SerializationMethod);

export default SerializationMethod;