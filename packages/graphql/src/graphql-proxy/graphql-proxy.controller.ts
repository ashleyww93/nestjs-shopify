import {
  AccessMode,
  ShopifySessionRequest,
  UseShopifyAuth,
} from '@nestjs-shopify/auth';
import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import {
  Controller,
  ForbiddenException,
  Inject,
  Post,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { Shopify } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';

@Controller('graphql')
@UseShopifyAuth(AccessMode.Online)
export class ShopifyGraphqlProxyController {
  constructor(
    @Inject(SHOPIFY_API_CONTEXT) private readonly shopifyApi: Shopify
  ) {}

  @Post()
  async proxy(
    @Req() req: ShopifySessionRequest<RawBodyRequest<IncomingMessage>>,
    @Res() res: ServerResponse
  ) {
    const session = req.shopifySession;
    if (!session) {
      throw new ForbiddenException('No session found');
    }

    const { body, headers } = await this.shopifyApi.clients.graphqlProxy({
      rawBody: req.rawBody?.toString() || '',
      session,
    });

    res.writeHead(200, headers);
    res.end(body);
  }
}