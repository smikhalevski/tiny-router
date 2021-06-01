import {Node, NodeType} from './router-types';

export function resolveRoute<Result>(node: Node<Result, undefined>, path: string): {result: Result, vars: Record<string, string>} | null;

export function resolveRoute<Result, Context = unknown>(node: Node<Result, Context>, path: string, context: Context, vars?: Record<string, string>): {result: Result, vars: Record<string, string>} | null;

export function resolveRoute(node: Node<unknown, any>, path: string, context?: unknown, vars: Record<string, string> = {}) {
  switch (node.nodeType) {

    case NodeType.ROUTE: {
      const match = node.re.exec(path);

      if (match == null || match[0] !== path) {
        return null;
      }

      if (match.length > 1) {
        vars = {...vars};

        for (const key in node.varMap) {
          vars[key] = match[node.varMap[key]];
        }
      }

      return {result: node.cb(vars, context), vars};
    }

    case NodeType.INDEX: {
      if (node.re) {
        const match = node.re.exec(path);

        if (match == null) {
          return null;
        }

        path = path.substring(match[0].length);

        if (match.length > 1) {
          vars = {...vars};

          for (const key in node.varMap) {
            vars[key] = match[node.varMap[key]];
          }
        }
      }
      for (let i = 0; i < node.children.length; i++) {
        const result = resolveRoute(node.children[i], path, context, vars);

        if (result !== null) {
          return result;
        }
      }
      return null;
    }

    case NodeType.IF: {
      if (node.condition(vars, context)) {
        return node.thenNode ? resolveRoute(node.thenNode, path, context, vars) : null;
      } else {
        return node.elseNode ? resolveRoute(node.elseNode, path, context, vars) : null;
      }
    }

    case NodeType.META:
      return resolveRoute(node.childNode, path, context, vars);
  }
}
