import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CoreGeometryDemo from '../samples/CoreGeometryDemo';
import EventDemo from '../samples/EventDemo';
import ObjectEventDemo from '../samples/ObjectEventDemo';
import GraphGIS from '../samples/GraphGIS/CoreViewExample';

export interface RouteConfig {
  path?: string;
  element?: React.ReactNode;
  children?: RouteConfig[];
  index?: boolean;
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: React.createElement(Layout),
    children: [
      {
        index: true,
        element: React.createElement(Navigate, { to: '/core-geometry-demo', replace: true }),
      },
      {
        path: 'core-geometry-demo',
        element: React.createElement(CoreGeometryDemo),
      },
      {
        path: 'event-demo',
        element: React.createElement(EventDemo),
      },
      {
        path: 'object-event-demo',
        element: React.createElement(ObjectEventDemo),
      },
      {
        path: 'graph-gis',
        element: React.createElement(GraphGIS),
      },
    ],
  },
]; 