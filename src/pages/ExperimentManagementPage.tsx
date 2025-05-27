// src/pages/ExperimentManagementPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Button,
  VStack,
  Table,
  Spinner,
  Alert,
  // AlertIcon, // Alert.Indicator 替换
  // Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, // V3 使用 Dialog
  Dialog, // V3 使用 Dialog [cite: 4135]
  Portal, // 用于将 Dialog 内容渲染到 body 末尾 [cite: 3257]
  Input,
  Textarea,
  useDisclosure,
  Link as ChakraLink,
  Flex,
  Text,
  IconButton, // 如果需要图标按钮
  Field, // V3 推荐的表单控制组件 [cite: 4116]
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LuPlus, LuPlay, LuSquare, LuView, LuX } from 'react-icons/lu';// 示例图标
import type { SessionResponse, StartSessionPayload } from '../types'; // 确保路径正确

// 从您的 Worker 获取API基础URL
const API_BASE_URL = 'https://gait.worker.zjhstudio.com'; // 替换为您的Worker URL

interface ExperimentSessionForUI extends SessionResponse {
  // 可以添加一些前端特有的辅助字段，如果需要
}

function ExperimentManagementPage() {
  const [sessions, setSessions] = useState<ExperimentSessionForUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 创建新实验相关的Modal控制
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const [newExperimentName, setNewExperimentName] = useState('');
  const [newExperimentNotes, setNewExperimentNotes] = useState('');
  const initialFocusRef = useRef(null); // 用于 Modal 的初始焦点

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`获取实验列表失败 (${response.status}): ${errData.message || response.statusText}`);
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err: any) {
      setError(err.message || '加载实验列表时发生未知错误');
      console.error("Fetch sessions error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async () => {
    if (!newExperimentName.trim()) {
      // 可以用Toast提示用户实验名称不能为空
      alert('实验名称不能为空！'); // 简单提示
      return;
    }
    setIsLoading(true); // 可以为按钮或表单设置加载状态
    const payload: StartSessionPayload = {
      experiment_name: newExperimentName,
      notes: newExperimentNotes,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `创建实验失败 (${response.status})`);
      }
      // alert(`实验 "${responseData.experiment_name}" 已成功开始！`); // Chakra UI Toast 更好
      onCreateModalClose(); // 关闭模态框
      setNewExperimentName(''); // 清空表单
      setNewExperimentNotes('');
      fetchSessions(); // 重新加载列表
    } catch (err: any) {
      setError(err.message || '创建实验时发生错误');
      console.error("Create session error:", err);
      // alert(err.message); // Chakra UI Toast 更好
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async (experimentName: string) => {
    if (!window.confirm(`确定要结束实验 "${experimentName}" 吗？`)) {
      return;
    }
    // 可以设置一个针对特定行的加载状态
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experiment_name: experimentName }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `结束实验失败 (${response.status})`);
      }
      // alert(`实验 "${experimentName}" 已成功结束！`); // Chakra UI Toast 更好
      fetchSessions(); // 重新加载列表
    } catch (err: any) {
      setError(err.message || '结束实验时发生错误');
      console.error("End session error:", err);
      // alert(err.message); // Chakra UI Toast 更好
    }
  };


  if (isLoading && sessions.length === 0) { // 初始加载时显示 Spinner
    return <Spinner size="xl" />;
  }

  if (error) {
    return (
      <Alert.Root status="error"> {/* V3 使用 Alert.Root [cite: 2441] */}
        <Alert.Indicator /> {/* V3 使用 Alert.Indicator [cite: 2441] */}
        <Alert.Title>{error}</Alert.Title> {/* V3 使用 Alert.Title [cite: 2441] */}
      </Alert.Root>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="xl">
          实验管理
        </Heading>
        <Button leftIcon={<LuPlus />} colorPalette="blue" onClick={onCreateModalOpen}> {/* V3 使用 colorPalette [cite: 4124] */}
          创建新实验
        </Button>
      </Flex>

      {sessions.length === 0 && !isLoading ? ( // 如果没有会话且不在加载中
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" textAlign="center">
          <Heading size="md" mb={4}>暂无实验记录</Heading>
          <Button colorPalette="green" onClick={onCreateModalOpen}>
            开始您的第一个实验！
          </Button>
        </Box>
      ) : (
        <Box borderWidth="1px" borderRadius="md" overflowX="auto">
          <Table.Root variant="simple"> {/* V3 使用 Table.Root [cite: 3583] */}
            <Table.Header> {/* V3 使用 Table.Header [cite: 3583] */}
              <Table.Row> {/* V3 使用 Table.Row [cite: 3583] */}
                <Table.ColumnHeader>实验名称</Table.ColumnHeader> {/* V3 使用 Table.ColumnHeader [cite: 3583] */}
                <Table.ColumnHeader>开始时间 (UTC)</Table.ColumnHeader>
                <Table.ColumnHeader>结束时间 (UTC)</Table.ColumnHeader>
                <Table.ColumnHeader>备注</Table.ColumnHeader>
                <Table.ColumnHeader>操作</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body> {/* V3 使用 Table.Body [cite: 3583] */}
              {sessions.map((session) => (
                <Table.Row key={session.experiment_name} _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}> {/* 使用 _dark [cite: 4104] */}
                  <Table.Cell fontWeight="medium"> {/* V3 使用 Table.Cell [cite: 3583] */}
                    <ChakraLink
                      as={RouterLink}
                      to={`/experiment/${encodeURIComponent(session.experiment_name)}/data`}
                      color="blue.600" // Chakra UI 颜色标记
                      _dark={{ color: "blue.300" }} // V3 使用 _dark [cite: 4104]
                    >
                      {session.experiment_name}
                    </ChakraLink>
                  </Table.Cell>
                  <Table.Cell>{new Date(session.start_time).toLocaleString()}</Table.Cell>
                  <Table.Cell>
                    {session.end_time ? new Date(session.end_time).toLocaleString() : (
                      <Text as="span" color="orange.500">进行中...</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell whiteSpace="pre-wrap" maxWidth="300px" overflow="hidden" textOverflow="ellipsis">
                    {session.notes || '-'}
                  </Table.Cell>
                  <Table.Cell>
                    <VStack align="flex-start" spacing={2}>
                      <Button
                        size="sm"
                        variant="outline" // Chakra UI V3 按钮变体
                        colorPalette="teal" // Chakra UI V3 颜色主题 [cite: 4124]
                        leftIcon={<LuView />}
                        onClick={() => navigate(`/experiment/${encodeURIComponent(session.experiment_name)}/data`)}
                      >
                        查看数据
                      </Button>
                      {!session.end_time && (
                        <Button
                          size="sm"
                          colorPalette="red" // Chakra UI V3 颜色主题
                          variant="solid"
                          leftIcon={<LuSquare />}
                          onClick={() => handleEndSession(session.experiment_name)}
                        >
                          结束实验
                        </Button>
                      )}
                    </VStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* 创建新实验的 Modal (Dialog in V3) */}
      <Dialog.Root isOpen={isCreateModalOpen} onClose={onCreateModalClose} initialFocusRef={initialFocusRef} size="xl"> {/* V3 Dialog [cite: 4135] */}
        <Portal> {/* Portal for Dialog [cite: 3257] */}
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>创建新实验</Dialog.Title> {/* V3 Dialog.Title [cite: 4135] */}
              </Dialog.Header>
              <Dialog.CloseTrigger asChild> {/* V3 Dialog.CloseTrigger [cite: 4135] */}
                  <IconButton aria-label="关闭" icon={<LuX />} variant="ghost" size="sm" position="absolute" top="1rem" right="1rem"/>
              </Dialog.CloseTrigger>
              <Dialog.Body>
                <VStack spacing={4}>
                  <Field.Root isRequired> {/* V3 Field [cite: 4116] */}
                    <Field.Label>实验名称</Field.Label> {/* V3 Field.Label [cite: 4116] */}
                    <Input
                      ref={initialFocusRef}
                      placeholder="例如：患者A康复测试第一周"
                      value={newExperimentName}
                      onChange={(e) => setNewExperimentName(e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>备注 (可选)</Field.Label>
                    <Textarea
                      placeholder="例如：记录天气、患者状态等信息"
                      value={newExperimentNotes}
                      onChange={(e) => setNewExperimentNotes(e.target.value)}
                    />
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer> {/* V3 Dialog.Footer [cite: 4135] */}
                <Button variant="ghost" onClick={onCreateModalClose} mr={3}>取消</Button>
                <Button colorPalette="blue" onClick={handleCreateSession} isLoading={isLoading}> {/* isLoading for button */}
                  开始实验
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
}

export default ExperimentManagementPage;