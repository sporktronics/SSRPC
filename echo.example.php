<?php

require('ssrpc.server.php');

$ssrpc = new SSRPC();

if ($data = $ssrpc->getData()) {
  $ssrpc->data('echo', $data);
  $ssrpc->data('rawData', file_get_contents('php://input'));
  $ssrpc->data('print_r', print_r($data, true));
 }

?>