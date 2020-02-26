let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { PostV1 } from '../../src/data/v1/PostV1';
import { PostStatusV1 } from '../../src/data/v1/PostStatusV1';
import { PostsMemoryPersistence } from '../../src/persistence/PostsMemoryPersistence';
import { PostsController } from '../../src/logic/PostsController';

const POST1: PostV1 = {
    id: '1',
    author_id: '1',
    status: PostStatusV1.Public,
    content_text: 'First post in system',
    create_time: "string",
    update_time: "string",
    attachment_ids: ["asd","asd"],
    comment_count: 0,
    view_count: 0,
    repost_count: 0,
    report_count: 0,
    like_count: 0,
};

const POST2: PostV1 = {
    id: '2',
    author_id: '1',
    status: PostStatusV1.Archive,
    content_text: 'Second post in system',
    create_time: "string",
    update_time: "string",
    attachment_ids: ["asd","asd"],
    comment_count: 0,
    view_count: 0,
    repost_count: 0,
    report_count: 0,
    like_count: 0,
};

suite('PostsController', () => {
    let persistence: PostsMemoryPersistence;
    let controller: PostsController;

    setup((done) => {
        persistence = new PostsMemoryPersistence();
        persistence.configure(new ConfigParams());

        controller = new PostsController();
        controller.configure(new ConfigParams());

        let references = References.fromTuples(
            new Descriptor('posts', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('posts', 'controller', 'default', 'default', '1.0'), controller
        );

        controller.setReferences(references);

        persistence.open(null, done);
    });

    teardown((done) => {
        persistence.close(null, done);
    });

    test('CRUD Operations', (done) => {
        let beacon1: PostV1;

        async.series([
            // Create the first post
            (callback) => {
                controller.createPost(
                    null,
                    POST1,
                    (err, beacon) => {
                        assert.isNull(err);
                        assert.isObject(beacon);
                        assert.equal(POST1.author_id, beacon.author_id);
                        assert.equal(POST1.content_text, beacon.content_text);
                        assert.equal(POST1.create_time, beacon.create_time);
                        assert.equal(POST1.id, beacon.id);

                        callback();
                    }
                );
            },
            // Create the second post
            (callback) => {
                controller.createPost(
                    null,
                    POST2,
                    (err, beacon) => {
                        assert.isNull(err);
                        assert.isObject(beacon);
                        assert.equal(POST2.author_id, beacon.author_id);
                        assert.equal(POST2.content_text, beacon.content_text);
                        assert.equal(POST2.create_time, beacon.create_time);
                        assert.equal(POST2.id, beacon.id);

                        callback();
                    }
                );
            },
            // Get all posts
            (callback) => {
                controller.getPosts(
                    null,
                    new FilterParams(),
                    new PagingParams(),
                    (err, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 2);

                        beacon1 = page.data[0];

                        callback();
                    }
                )
            },
            // Update the beacon
            (callback) => {
                beacon1.content_text = 'ABC';

                controller.updatePost(
                    null,
                    beacon1,
                    (err, beacon) => {
                        assert.isNull(err);

                        assert.isObject(beacon);
                        assert.equal(beacon1.id, beacon.id);
                        assert.equal('ABC', beacon.content_text);

                        callback();
                    }
                )
            },
            // Get beacon by udi
            (callback) => {
                controller.getPostById(
                    null, 
                    beacon1.id,
                    (err, beacon) => {
                        assert.isNull(err);

                        assert.isObject(beacon);
                        assert.equal(beacon1.id, beacon.id);

                        callback();
                    }
                )
            },
            // Delete the beacon
            (callback) => {
                controller.deletePostById(
                    null,
                    beacon1.id,
                    (err, beacon) => {
                        assert.isNull(err);

                        assert.isObject(beacon);
                        assert.equal(beacon1.id, beacon.id);

                        callback();
                    }
                )
            },
            // Try to get deleted beacon
            (callback) => {
                controller.getPostById(
                    null,
                    beacon1.id,
                    (err, beacon) => {
                        assert.isNull(err);

                        assert.isNull(beacon || null);

                        callback();
                    }
                )
            }
        ], done);
    });


    // test('Calculate Positions', (done) => {
    //     async.series([
    //         // Create the first beacon
    //         (callback) => {
    //             controller.createBeacon(
    //                 null,
    //                 BEACON1,
    //                 (err, beacon) => {
    //                     assert.isNull(err);

    //                     assert.isObject(beacon);
    //                     assert.equal(BEACON1.udi, beacon.udi);
    //                     assert.equal(BEACON1.site_id, beacon.site_id);
    //                     assert.equal(BEACON1.type, beacon.type);
    //                     assert.equal(BEACON1.label, beacon.label);
    //                     assert.isNotNull(beacon.center);

    //                     callback();
    //                 }
    //             );
    //         },
    //         // Create the second beacon
    //         (callback) => {
    //             controller.createBeacon(
    //                 null,
    //                 BEACON2,
    //                 (err, beacon) => {
    //                     assert.isNull(err);

    //                     assert.isObject(beacon);
    //                     assert.equal(BEACON2.udi, beacon.udi);
    //                     assert.equal(BEACON2.site_id, beacon.site_id);
    //                     assert.equal(BEACON2.type, beacon.type);
    //                     assert.equal(BEACON2.label, beacon.label);
    //                     assert.isNotNull(beacon.center);

    //                     callback();
    //                 }
    //             );
    //         },
    //         // Calculate position for one beacon
    //         (callback) => {
    //             controller.calculatePosition(
    //                 null, '1', ['00001'],
    //                 (err, position) => {
    //                     assert.isNull(err);

    //                     assert.isObject(position);
    //                     assert.equal('Point', position.type);
    //                     assert.lengthOf(position.coordinates, 2);
    //                     assert.equal(0, position.coordinates[0]);
    //                     assert.equal(0, position.coordinates[1]);

    //                     callback();
    //                 }
    //             )
    //         },
    //         // Calculate position for two beacons
    //         (callback) => {
    //             controller.calculatePosition(
    //                 null, '1', ['00001', '00002'],
    //                 (err, position) => {
    //                     assert.isNull(err);

    //                     assert.isObject(position);
    //                     assert.equal('Point', position.type);
    //                     assert.lengthOf(position.coordinates, 2);
    //                     assert.equal(1, position.coordinates[0]);
    //                     assert.equal(1, position.coordinates[1]);

    //                     callback();
    //                 }
    //             )
    //         }
    //     ], done);
    // });
});