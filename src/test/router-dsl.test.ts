import {IRouteNode, NodeType, route} from '../main';
import {IPathSegmentNode} from '@smikhalevski/route-pattern';

describe('route', () => {

  test('creates a route node', () => {
    const cb = () => 0;

    const node: IRouteNode<unknown, unknown> = {
      nodeType: NodeType.ROUTE,
      parent: null,
      rawPath: '/foo',
      path: {
        nodeType: 0,
        parent: null,
        start: 0,
        end: 4,
        absolute: true,
        children: [
          {
            nodeType: 1,
            parent: null,
            start: 0,
            end: 4,
            children: [
              {
                nodeType: 6,
                parent: null,
                value: 'foo',
                start: 1,
                end: 4,
              },
            ],
          },
        ],
      },
      re: expect.any(RegExp),
      cb,
    };

    node.path.children[0].parent = node.path;
    (node.path.children[0] as IPathSegmentNode).children[0].parent = node.path.children[0];

    expect(route('/foo', cb)).toEqual(node);
  });
});
