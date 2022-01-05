import {IVariableNode, Node, NodeType, parsePattern} from '../main';

describe('parsePattern', () => {

  test('parses blank pattern', () => {
    expect(parsePattern(' ')).toEqual<Node>({
      nodeType: NodeType.PATH,
      absolute: false,
      children: [],
      parent: null,
      start: 0,
      end: 0,
    });
  });

  test('parses absolute path', () => {
    let node1: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: true,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [],
          parent: null,
          start: 1,
          end: 2,
        },
      ],
      parent: null,
      start: 1,
      end: 2,
    };

    node1.parent = rootNode;

    expect(parsePattern(' / ')).toEqual(rootNode);
  });

  test('parses sequential path separators', () => {
    let node1: Node;
    let node2: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: true,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [],
          parent: null,
          start: 0,
          end: 1,
        },
        node2 = {
          nodeType: NodeType.SEGMENT,
          children: [],
          parent: null,
          start: 1,
          end: 2,
        },
      ],
      parent: null,
      start: 0,
      end: 2,
    };

    node1.parent = rootNode;
    node2.parent = rootNode;

    expect(parsePattern('//')).toEqual(rootNode);
  });

  test('parses wildcard', () => {
    let node1: Node;
    let node11: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.WILDCARD,
              greedy: false,
              parent: null,
              start: 0,
              end: 1,
            },
          ],
          parent: null,
          start: 0,
          end: 1,
        },
      ],
      parent: null,
      start: 0,
      end: 1,
    };

    node1.parent = rootNode;
    node11.parent = node1;

    expect(parsePattern('*')).toEqual(rootNode);
  });

  test('parses greedy wildcard', () => {
    let node1: Node;
    let node11: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.WILDCARD,
              greedy: true,
              parent: null,
              start: 0,
              end: 2,
            },
          ],
          parent: null,
          start: 0,
          end: 2,
        },
      ],
      parent: null,
      start: 0,
      end: 2,
    };

    node1.parent = rootNode;
    node11.parent = node1;

    expect(parsePattern('**')).toEqual(rootNode);
  });

  test('parses text', () => {

    let node1: Node;
    let node11: Node;
    let node2: Node;
    let node21: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.TEXT,
              value: 'foo',
              parent: null,
              start: 0,
              end: 3,
            },
          ],
          parent: null,
          start: 0,
          end: 3,
        },
        node2 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node21 = {
              nodeType: NodeType.TEXT,
              value: 'bar',
              parent: null,
              start: 4,
              end: 7,
            },
          ],
          parent: null,
          start: 3,
          end: 7,
        },
      ],
      parent: null,
      start: 0,
      end: 7,
    };

    node1.parent = rootNode;
    node11.parent = node1;

    node2.parent = rootNode;
    node21.parent = node2;

    expect(parsePattern('foo/bar')).toEqual(rootNode);
  });

  test('parses quoted text', () => {
    let node1: Node;
    let node11: Node;
    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.TEXT,
              value: 'foo bar',
              parent: null,
              start: 1,
              end: 10,
            },
          ],
          parent: null,
          start: 1,
          end: 10,
        },
      ],
      parent: null,
      start: 1,
      end: 10,
    };

    node1.parent = rootNode;
    node11.parent = node1;

    expect(parsePattern(' "foo bar" ')).toEqual(rootNode);
  });

  test('does not respect escape character in non-quoted text', () => {
    let node1: Node;
    let node11: Node;
    let node2: Node;
    let node21: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.TEXT,
              value: 'foo\\',
              parent: null,
              start: 0,
              end: 4,
            },
          ],
          parent: null,
          start: 0,
          end: 4,
        },
        node2 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node21 = {
              nodeType: NodeType.TEXT,
              value: 'bar',
              parent: null,
              start: 5,
              end: 8,
            },
          ],
          parent: null,
          start: 4,
          end: 8,
        },
      ],
      parent: null,
      start: 0,
      end: 8,
    };

    node1.parent = rootNode;
    node11.parent = node1;

    node2.parent = rootNode;
    node21.parent = node2;

    expect(parsePattern('foo\\/bar')).toEqual(rootNode);
  });

  test('respects escape character in quoted text', () => {
    let node1: Node;
    let node11: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.TEXT,
              value: 'foo"bar',
              parent: null,
              start: 0,
              end: 10,
            },
          ],
          parent: null,
          start: 0,
          end: 10,
        },
      ],
      parent: null,
      start: 0,
      end: 10,
    };

    node1.parent = rootNode;
    node11.parent = node1;

    expect(parsePattern('"foo\\"bar"')).toEqual(rootNode);
  });

  test('parses regexp', () => {
    let node1: Node;
    let node11: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.REG_EXP,
              pattern: '\\d+',
              groupCount: 0,
              parent: null,
              start: 0,
              end: 5,
            },
          ],
          parent: null,
          start: 0,
          end: 5,
        },
      ],
      parent: null,
      start: 0,
      end: 5,
    };

    node1.parent = rootNode;
    node11.parent = node1;

    expect(parsePattern('(\\d+)')).toEqual(rootNode);
  });

  test('parses variable', () => {
    let node1: Node;
    let node11: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.VARIABLE,
              name: 'foo',
              constraint: null,
              parent: null,
              start: 0,
              end: 4,
            },
          ],
          parent: null,
          start: 0,
          end: 4,
        },
      ],
      parent: null,
      start: 0,
      end: 4,
    };

    node1.parent = rootNode;
    node11.parent = node1;

    expect(parsePattern(':foo')).toEqual(rootNode);
  });

  test('parses multiple variables with same names', () => {
    let node1: Node;
    let node11: Node;
    let node2: Node;
    let node21: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.VARIABLE,
              name: 'foo',
              constraint: null,
              parent: null,
              start: 0,
              end: 4,
            },
          ],
          parent: null,
          start: 0,
          end: 4,
        },
        node2 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node21 = {
              nodeType: NodeType.VARIABLE,
              name: 'foo',
              constraint: null,
              parent: null,
              start: 5,
              end: 9,
            },
          ],
          parent: null,
          start: 4,
          end: 9,
        },
      ],
      parent: null,
      start: 0,
      end: 9,
    };

    node1.parent = rootNode;
    node11.parent = node1;

    node2.parent = rootNode;
    node21.parent = node2;

    expect(parsePattern(':foo/:foo')).toEqual(rootNode);
  });

  test('parses variable with text constraint', () => {
    let node1: Node;
    let node11: IVariableNode;
    let node111: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.VARIABLE,
              name: 'foo',
              constraint: node111 = {
                nodeType: NodeType.TEXT,
                value: 'bar',
                parent: null,
                start: 5,
                end: 8,
              },
              parent: null,
              start: 0,
              end: 8,
            },
          ],
          parent: null,
          start: 0,
          end: 8,
        },
      ],
      parent: null,
      start: 0,
      end: 8,
    };

    node1.parent = rootNode;
    node11.parent = node1;
    node111.parent = node11;

    expect(parsePattern(':foo bar')).toEqual(rootNode);
  });

  test('parses variable with quoted text constraint', () => {
    let node1: Node;
    let node11: IVariableNode;
    let node111: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.VARIABLE,
              name: 'foo',
              constraint: node111 = {
                nodeType: NodeType.TEXT,
                value: 'bar',
                parent: null,
                start: 4,
                end: 9,
              },
              parent: null,
              start: 0,
              end: 9,
            },
          ],
          parent: null,
          start: 0,
          end: 9,
        },
      ],
      parent: null,
      start: 0,
      end: 9,
    };

    node1.parent = rootNode;
    node11.parent = node1;
    node111.parent = node11;

    expect(parsePattern(':foo"bar"')).toEqual(rootNode);
  });

  test('does not overwrite variable constraint', () => {
    let node1: Node;
    let node11: IVariableNode;
    let node111: Node;
    let node12: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.VARIABLE,
              name: 'foo',
              constraint: node111 = {
                nodeType: NodeType.TEXT,
                value: 'bar',
                parent: null,
                start: 4,
                end: 9,
              },
              parent: null,
              start: 0,
              end: 9,
            },
            node12 = {
              nodeType: NodeType.TEXT,
              value: 'qux',
              parent: null,
              start: 10,
              end: 13,
            },
          ],
          parent: null,
          start: 0,
          end: 13,
        },
      ],
      parent: null,
      start: 0,
      end: 13,
    };

    node1.parent = rootNode;
    node11.parent = node1;
    node111.parent = node11;
    node12.parent = node1;

    expect(parsePattern(':foo"bar" qux')).toEqual(rootNode);
  });

  test('parses sequential variables', () => {
    let node1: Node;
    let node11: Node;
    let node12: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.VARIABLE,
              name: 'foo',
              constraint: null,
              parent: null,
              start: 0,
              end: 4,
            },
            node12 = {
              nodeType: NodeType.VARIABLE,
              name: 'bar',
              constraint: null,
              parent: null,
              start: 4,
              end: 8,
            },
          ],
          parent: null,
          start: 0,
          end: 8,
        },
      ],
      parent: null,
      start: 0,
      end: 8,
    };

    node1.parent = rootNode;
    node11.parent = node1;
    node12.parent = node1;

    expect(parsePattern(':foo:bar')).toEqual(rootNode);
  });

  test('parses empty alternation', () => {
    let node1: Node;
    let node11: Node;
    let node111: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.ALT,
              children: [
                node111 = {
                  nodeType: NodeType.PATH,
                  absolute: false,
                  children: [],
                  parent: null,
                  start: 1,
                  end: 1,
                },
              ],
              parent: null,
              start: 0,
              end: 2,
            },
          ],
          parent: null,
          start: 0,
          end: 2,
        },
      ],
      parent: null,
      start: 0,
      end: 2,
    };

    node1.parent = rootNode;
    node11.parent = node1;
    node111.parent = node11;

    expect(parsePattern('{}')).toEqual(rootNode);
  });

  test('parses alternation', () => {
    let node1: Node;
    let node11: Node;
    let node111: Node;
    let node1111: Node;
    let node11111: Node;
    let node112: Node;
    let node1121: Node;
    let node11211: Node;

    const rootNode: Node = {
      nodeType: NodeType.PATH,
      absolute: false,
      children: [
        node1 = {
          nodeType: NodeType.SEGMENT,
          children: [
            node11 = {
              nodeType: NodeType.ALT,
              children: [
                node111 = {
                  nodeType: NodeType.PATH,
                  absolute: false,
                  children: [
                    node1111 = {
                      nodeType: NodeType.SEGMENT,
                      children: [
                        node11111 = {
                          nodeType: NodeType.TEXT,
                          value: 'foo',
                          parent: null,
                          start: 1,
                          end: 4,
                        },
                      ],
                      parent: null,
                      start: 1,
                      end: 4,
                    },
                  ],
                  parent: null,
                  start: 1,
                  end: 4,
                },
                node112 = {
                  nodeType: NodeType.PATH,
                  absolute: false,
                  children: [
                    node1121 = {
                      nodeType: NodeType.SEGMENT,
                      children: [
                        node11211 = {
                          nodeType: NodeType.TEXT,
                          value: 'bar',
                          parent: null,
                          start: 6,
                          end: 9,
                        },
                      ],
                      parent: null,
                      start: 6,
                      end: 9,
                    },
                  ],
                  parent: null,
                  start: 6,
                  end: 9,
                },
              ],
              parent: null,
              start: 0,
              end: 10,
            },
          ],
          parent: null,
          start: 0,
          end: 10,
        },
      ],
      parent: null,
      start: 0,
      end: 10,
    };

    node1.parent = rootNode;
    node11.parent = node1;
    node111.parent = node11;
    node1111.parent = node111;
    node11111.parent = node1111;
    node112.parent = node11;
    node1121.parent = node112;
    node11211.parent = node1121;

    expect(parsePattern('{foo, bar}')).toEqual(rootNode);
  });

  test('throws on invalid variable name', () => {
    expect(() => parsePattern(':123foo')).toThrow(new SyntaxError('Unexpected syntax at 0'));
  });

  test('throws on unexpected alternation separator', () => {
    expect(() => parsePattern('foo, bar}')).toThrow(new SyntaxError('Unexpected alternation separator at 3'));
  });

  test('throws on unexpected alternation end', () => {
    expect(() => parsePattern('foo}')).toThrow(new SyntaxError('Unexpected alternation end at 3'));
  });

  test('throws on unterminated alternation', () => {
    expect(() => parsePattern('{foo')).toThrow(new SyntaxError('Unterminated alternation at 4'));
  });
});
